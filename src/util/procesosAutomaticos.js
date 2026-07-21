import cron from 'node-cron';
import { asignacionService } from '../services/asignacion.service.js';
import { sequelize } from './connections.js';
import { pedidoService } from '../services/pedido.service.js';
import { puntoEncuentroService } from '../services/puntoEncuentro.service.js';
import { isRetryableDbError, withDbRetry } from './dbRetry.js';

// Configuración de intervalos (ms y segundos) configurable por env
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production' || NODE_ENV === 'prod';

// Intervalo entre ejecuciones del proceso principal (en ms). Cuánto tarda un
// pedido recién puesto "En Camino" en generarle una propuesta de asignación
// a un repartidor es, en el peor caso, este intervalo (más el polling de 1s
// del celular) — 15s hacía sentir la demo lenta, 5s la hace ágil sin generar
// carga real dado el volumen de esta app.
const DEFAULT_INTERVAL_MS = 5 * 1000;
const PROCESOS_INTERVAL_MS = process.env.PROCESOS_INTERVAL_MS ? parseInt(process.env.PROCESOS_INTERVAL_MS, 10) : DEFAULT_INTERVAL_MS;

// Ventana en segundos usada para determinar si una asignación es reciente/caducable.
// Tiene que coincidir con ASIGNACION_WINDOW_SECONDS en my-app/Views/Pedidos/CardAsignacionPedido.js
// (el celular oculta la propuesta sola pasado ese tiempo, sin importar si el backend la sigue
// considerando "Pendiente"). El ternario anterior daba 45 en los dos casos pese al comentario.
const DEFAULT_WINDOW_SECONDS = 300;
const ASIGNACION_WINDOW_SECONDS = process.env.ASIGNACION_WINDOW_SECONDS ? parseInt(process.env.ASIGNACION_WINDOW_SECONDS, 10) : DEFAULT_WINDOW_SECONDS;

// Control de ejecuciones vacías para optimizar costos
let ejecucionesVacias = 0;
let procesoActivo = false;
let intervalId = null;
const MAX_EJECUCIONES_VACIAS = 3;
const PROCESOS_DB_RETRY_ATTEMPTS = Number(process.env.PROCESOS_DB_RETRY_ATTEMPTS || 2);
const PROCESOS_DB_RETRY_DELAY_MS = Number(process.env.PROCESOS_DB_RETRY_DELAY_MS || 1000);

async function withProcesosDbRetry(operationName, operation) {
  return withDbRetry(operationName, operation, {
    attempts: PROCESOS_DB_RETRY_ATTEMPTS,
    baseDelayMs: PROCESOS_DB_RETRY_DELAY_MS,
  });
}

// Función para reactivar los procesos automáticos
export function reactivarProcesosAutomaticos() {
  if (!procesoActivo) {
    console.log('🔄 Reactivando procesos automáticos por nueva actividad');
    ejecucionesVacias = 0;
    procesoActivo = true;
    // Reiniciar el intervalo
    iniciarProcesosAutomaticos();
  }
}

// Función para detener completamente los procesos
function detenerProcesosAutomaticos() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    procesoActivo = false;
    console.log('💤 Procesos automáticos completamente detenidos (ahorro de costos)');
    console.log('   Se reactivarán automáticamente con la próxima petición HTTP');
  }
}

// Función interna que contiene la lógica del intervalo
function iniciarProcesosAutomaticos() {
  // Si ya hay un intervalo activo, no crear otro
  if (intervalId) {
    return;
  }

  intervalId = setInterval(async () => {
    try {
      // Contador de trabajo realizado en esta ejecución
      let trabajoRealizado = false;

      await caducarAsignaciones();
      const pedidos = await obtenerPedidosParaAsignacion();
      if (pedidos.length > 0) {
        console.log('Pedidos pendientes de asignar:', pedidos.map(p => p.id));
        trabajoRealizado = true;
      }

      for (const pedido of pedidos) {
        const existeAsignacion = await verificarAsignacionPorPedidoCompleto(pedido.id);

        if (!existeAsignacion) {
          const repartidorid = await obtenerRepartidor(pedido.eventoId, pedido.id);
          if (repartidorid.repartidoreId == -2) {
            console.warn("error al asignar repartidor");
            await borrarAsignacionesRechazadas();
            await borrarAsignacionesCaducadas();
          } else if (repartidorid.repartidoreId == -1) {
            console.warn("no hay repartidores disponibles");
            await borrarAsignacionesRechazadas();
            await borrarAsignacionesCaducadas();
          } else {
            if (repartidorid.repartidoreId) {
              console.warn("hay repartidores disponibles");
              await asignacionService.create('Pendiente', pedido.id, repartidorid.repartidoreId);
            }
          }
        }
      }

      const pedidosActualizar = await obtenerPedidosParaActualizar();

      if (pedidosActualizar.length > 0) {
        trabajoRealizado = true;
      }

      for (const pedido of pedidosActualizar) {
        const existeAsignacion = await verificarAsignacionPorPedido(pedido.id);

        if (existeAsignacion) {
          const repartidoridN = await obtenerRepartidorAsignado(pedido.id);
          const idPE = await puntoEncuentroService.getAllInEvent(pedido.eventoId);
          await pedidoService.setDatosExtraPedido(pedido.id, repartidoridN, generateCode(), idPE[0]);
        }
      }

      // Control de ejecuciones vacías
      if (trabajoRealizado) {
        // Si hubo trabajo, resetear el contador
        ejecucionesVacias = 0;
        console.log('✅ Proceso completado con trabajo realizado');
      } else {
        // Si no hubo trabajo, incrementar contador
        ejecucionesVacias++;
        console.log(`⚠️  Ejecución vacía ${ejecucionesVacias}/${MAX_EJECUCIONES_VACIAS}`);
        
        // Si alcanzamos el límite, detener completamente el proceso
        if (ejecucionesVacias >= MAX_EJECUCIONES_VACIAS) {
          detenerProcesosAutomaticos();
        }
      }
    } catch (error) {
      console.error('Error al actualizar pedidos:', error);
      // En caso de error, no contar como ejecución vacía
      ejecucionesVacias = 0;
      if (isRetryableDbError(error)) {
        console.warn('DB inestable detectada en procesosAutomaticos, pausando procesos hasta nueva actividad HTTP.');
        detenerProcesosAutomaticos();
      }
    }
  }, PROCESOS_INTERVAL_MS);
}

// Función principal que se llama al iniciar el servidor
export function procesosAutomaticos() {
  console.log('📋 Sistema de procesos automáticos inicializado');
  console.log('   Los procesos se activarán con la primera petición HTTP');
  // No iniciamos los procesos automáticamente, esperamos la primera petición
}
  

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// Verificar si un pedido ya tiene una asignación aceptada
export async function verificarAsignacionPorPedido(pedidoId) {
  try {
    const resultado = await withProcesosDbRetry('verificar asignación por pedido aceptado', () => sequelize.query(
      `
            SELECT EXISTS (
                SELECT 1
                FROM "Asignacions"
                WHERE "PedidoId" = :pedidoId
                  AND (estado = 'Aceptado')
            ) AS "existe";
        `,
      {
        replacements: { pedidoId },
        type: sequelize.QueryTypes.SELECT,
        logging: false,
      }
    ));

    return resultado[0].existe;
  } catch (error) {
    console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}
// Verificar si un pedido ya tiene una asignación aceptada
export async function verificarAsignacionPorPedidoCompleto(pedidoId) {
  try {
    const resultado = await withProcesosDbRetry('verificar asignación por pedido completo', () => sequelize.query(
      `
            SELECT EXISTS (
                SELECT 1
                FROM "Asignacions"
                WHERE "PedidoId" = :pedidoId
                  AND (estado = 'Aceptado' or estado= 'Pendiente')
            ) AS "existe";
        `,
      {
        replacements: { pedidoId },
        type: sequelize.QueryTypes.SELECT,
        logging: false,
      }
    ));

    return resultado[0].existe;
  } catch (error) {
    console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}

export async function obtenerRepartidorAsignado(pedidoId) {
  try {
    const resultado = await withProcesosDbRetry('obtener repartidor asignado por pedido', () => sequelize.query(
      `
            select "repartidoreId" from "Asignacions" where "PedidoId" = :pedidoId
        `,
      {
        replacements: { pedidoId },
        type: sequelize.QueryTypes.SELECT,
        logging: false,
      }
    ));

    // Asegúrate de acceder al campo correcto
    // Nota: Si la columna no existe, `resultado[0]` será `undefined`
    return resultado.length > 0 ? resultado[0].repartidoreId : null;
  } catch (error) {
    console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}

// Devuelve una expresión SQL para 'NOW() - INTERVAL ...' compatible con el dialecto
function nowMinusSecondsExpr(seconds) {
  const dialect = sequelize.getDialect ? sequelize.getDialect() : (sequelize.options && sequelize.options.dialect) || 'postgres';
  if (dialect === 'sqlite' || dialect === 'mssql' || dialect === 'mysql') {
    // SQLite: datetime('now','-NN seconds')
    if (dialect === 'sqlite') {
      return `datetime('now', '-${seconds} seconds')`;
    }
    // MySQL and MSSQL alternative using DATE_SUB for MySQL, DATEADD for MSSQL
    if (dialect === 'mysql') {
      return `NOW() - INTERVAL ${seconds} SECOND`;
    }
    if (dialect === 'mssql') {
      return `DATEADD(second, -${seconds}, GETUTCDATE())`;
    }
  }
  // Por defecto usar sintaxis Postgres
  return `NOW() - INTERVAL '${seconds} seconds'`;
}

// Obtener pedidos que necesitan asignación
export async function obtenerPedidosParaAsignacion() {
    const timeExpr = nowMinusSecondsExpr(ASIGNACION_WINDOW_SECONDS);
    const pedidos = await withProcesosDbRetry('obtener pedidos para asignación', () => sequelize.query(
    `
        SELECT id, "eventoId"
        FROM "Pedidos" p
        WHERE p."repartidorId" IS NULL and estado = 'EnCamino'
          AND NOT EXISTS (
              SELECT 1
              FROM "Asignacions" arp
              WHERE arp."PedidoId" = p.id
                AND arp.estado = 'Pendiente'
                AND arp."createdAt" >= ${timeExpr}
          );
    `,
    { type: sequelize.QueryTypes.SELECT, logging: false }
  ));

  return pedidos;
}

// Obtener pedidos que necesitan asignación
export async function obtenerPedidosParaActualizar() {
    const timeExpr = nowMinusSecondsExpr(ASIGNACION_WINDOW_SECONDS);
    const pedidos = await withProcesosDbRetry('obtener pedidos para actualizar', () => sequelize.query(
    `
        SELECT id, "eventoId"
        FROM "Pedidos" p
        WHERE p."repartidorId" IS NULL and estado = 'EnCamino' and "codigoEntrega" is NULL
          AND EXISTS (
              SELECT 1
              FROM "Asignacions" arp
              WHERE arp."PedidoId" = p.id
                AND arp.estado = 'Aceptado'
                AND arp."createdAt" >= ${timeExpr}
          );
    `,
    { type: sequelize.QueryTypes.SELECT, logging: false }
  ));

  return pedidos;
}

// Obtener repartidores ordenados por prioridad
const obtenerRepartidor = async (eventoId, pedidoId) => {
  try {
    // Ejecutar la función SQL para obtener el repartidor seleccionado
    const [results] = await withProcesosDbRetry('seleccionar repartidor por evento', () => sequelize.query(
      `
            SELECT seleccionar_repartidor_por_evento(:eventoId, :pedidoId) AS repartidor_id;
        `,
      {
        replacements: { eventoId, pedidoId },
        type: sequelize.QueryTypes.SELECT,
        logging: false,
      }
    ));
    //console.log("resultados",results)

    // Verificar si se encontró un repartidor
    const repartidorId = results.repartidor_id;
    if (repartidorId === -1) {
      //console.log(`No hay repartidores disponibles para el evento ${eventoId} y pedido ${pedidoId}`);
      await borrarAsignacionesRechazadas();
      await borrarAsignacionesCaducadas();
      return -1;
    } else {
      return {
        repartidoreId: repartidorId,
      };
    }
  } catch (error) {
    //console.error('Error al obtener repartidor:', error);
    return -2;
  }
};

// Borrar asignaciones pendientes viejas
export async function borrarAsignacionesPendienteViejas() {
  try {
    const timeExpr = nowMinusSecondsExpr(ASIGNACION_WINDOW_SECONDS);
    await withProcesosDbRetry('borrar asignaciones pendientes viejas', () => sequelize.query(
      `
            DELETE FROM "Asignacions"
            WHERE estado = 'Pendiente'
              AND "createdAt" < ${timeExpr}
            RETURNING *;
        `,
      { type: sequelize.QueryTypes.DELETE, logging: false }
    ));

    //console.log('Asignaciones viejas pendientes eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones viejas pendientes:', error);
  }
}

// Borrar asignaciones rechazadas
export async function borrarAsignacionesCaducadas() {
  try {
    await withProcesosDbRetry('borrar asignaciones caducadas', () => sequelize.query(
      `
            DELETE FROM "Asignacions"
            WHERE estado='Caducado';
        `,
      { type: sequelize.QueryTypes.DELETE, logging: false }
    ));

    //console.log('Asignaciones rechazadas eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones rechazadas:', error);
  }
}

// Borrar asignaciones rechazadas
export async function borrarAsignacionesRechazadas() {
  try {
    await withProcesosDbRetry('borrar asignaciones rechazadas', () => sequelize.query(
      `
            DELETE FROM "Asignacions"
            WHERE estado = 'Rechazado';
        `,
      { type: sequelize.QueryTypes.DELETE, logging: false }
    ));

    //console.log('Asignaciones rechazadas eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones rechazadas:', error);
  }
}

export async function caducarAsignaciones() {
  try {
    const timeExpr = nowMinusSecondsExpr(ASIGNACION_WINDOW_SECONDS);
    const [results] = await withProcesosDbRetry('caducar asignaciones pendientes', () => sequelize.query(
      `
      UPDATE "Asignacions"
      SET estado = 'Caducado'
      WHERE estado = 'Pendiente'
        AND "createdAt" < ${timeExpr}
      RETURNING *;
    `,
      { type: sequelize.QueryTypes.UPDATE, logging: false }
    ));

    //console.log(`${results.length} asignaciones caducadas actualizadas.`);
  } catch (error) {
    //console.error('Error al caducar asignaciones:', error);
  }
}
