import cron from 'node-cron';
import { asignacionService } from '../services/asignacion.service.js';
import { sequelize } from './connections.js';
import { pedidoService } from '../services/pedido.service.js';
import { puntoEncuentroService } from '../services/puntoEncuentro.service.js';

// Configuración de intervalos (ms y segundos) configurable por env
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production' || NODE_ENV === 'prod';

// Intervalo entre ejecuciones del proceso principal (en ms)
const DEFAULT_INTERVAL_MS = IS_PROD ? 5 * 60 * 1000 : 10 * 1000; // prod: 5min, dev: 10s
const PROCESOS_INTERVAL_MS = process.env.PROCESOS_INTERVAL_MS ? parseInt(process.env.PROCESOS_INTERVAL_MS, 10) : DEFAULT_INTERVAL_MS;

// Ventana en segundos usada para determinar si una asignación es reciente/caducable
const DEFAULT_WINDOW_SECONDS = IS_PROD ? 300 : 45; // prod: 5min, dev: 45s
const ASIGNACION_WINDOW_SECONDS = process.env.ASIGNACION_WINDOW_SECONDS ? parseInt(process.env.ASIGNACION_WINDOW_SECONDS, 10) : DEFAULT_WINDOW_SECONDS;

// Control de ejecuciones vacías para optimizar costos
let ejecucionesVacias = 0;
let procesoActivo = true;
let intervalId = null;
const MAX_EJECUCIONES_VACIAS = 3;

// Función para reactivar los procesos automáticos
export function reactivarProcesosAutomaticos() {
  if (!procesoActivo) {
    console.log('🔄 Reactivando procesos automáticos por nueva actividad');
    ejecucionesVacias = 0;
    procesoActivo = true;
  }
}

export function procesosAutomaticos() {
    intervalId = setInterval(async () => {
      try {
        // Si el proceso está deshabilitado, no ejecutar
        if (!procesoActivo) {
          console.log('⏸️  Procesos automáticos pausados (sin actividad)');
          return;
        }

        console.warn('procesosAutomaticos');
        
        // Contador de trabajo realizado en esta ejecución
        let trabajoRealizado = false;
        
        await caducarAsignaciones();
        const pedidos = await obtenerPedidosParaAsignacion();
        console.warn('pedidos pendientes de asignar', pedidos);
  
        if (pedidos.length > 0) {
          trabajoRealizado = true;
        }

        for (const pedido of pedidos) {
          const existeAsignacion = await verificarAsignacionPorPedidoCompleto(pedido.id);
          console.warn('existeAsignacion', existeAsignacion);
  
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
          
          // Si alcanzamos el límite, deshabilitar el proceso
          if (ejecucionesVacias >= MAX_EJECUCIONES_VACIAS) {
            procesoActivo = false;
            console.log('💤 Procesos automáticos deshabilitados por inactividad (ahorro de costos)');
            console.log('   Se reactivarán automáticamente con la próxima petición');
          }
        }
      } catch (error) {
        console.error('Error al actualizar pedidos:', error);
        // En caso de error, no contar como ejecución vacía
        ejecucionesVacias = 0;
      }
    }, PROCESOS_INTERVAL_MS); // Intervalo configurable
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
    const resultado = await sequelize.query(
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
    );

    return resultado[0].existe;
  } catch (error) {
    console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}
// Verificar si un pedido ya tiene una asignación aceptada
export async function verificarAsignacionPorPedidoCompleto(pedidoId) {
  try {
    const resultado = await sequelize.query(
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
    );

    return resultado[0].existe;
  } catch (error) {
    console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}

export async function obtenerRepartidorAsignado(pedidoId) {
  try {
    const resultado = await sequelize.query(
      `
            select "repartidoreId" from "Asignacions" where "PedidoId" = :pedidoId
        `,
      {
        replacements: { pedidoId },
        type: sequelize.QueryTypes.SELECT,
        logging: false,
      }
    );

    // Asegúrate de acceder al campo correcto
    // Nota: Si la columna no existe, `resultado[0]` será `undefined`
    return resultado.length > 0 ? resultado[0].repartidoreId : null;
  } catch (error) {
    console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}

// Obtener pedidos que necesitan asignación
export async function obtenerPedidosParaAsignacion() {
    const pedidos = await sequelize.query(
    `
        SELECT id, "eventoId"
        FROM "Pedidos" p
        WHERE p."repartidorId" IS NULL and estado = 'EnCamino'
          AND NOT EXISTS (
              SELECT 1
              FROM "Asignacions" arp
              WHERE arp."PedidoId" = p.id
                AND arp.estado = 'Pendiente'
                AND arp."createdAt" >= NOW() - INTERVAL '${ASIGNACION_WINDOW_SECONDS} seconds'
          );
    `,
    { type: sequelize.QueryTypes.SELECT, logging: false }
  );

  return pedidos;
}

// Obtener pedidos que necesitan asignación
export async function obtenerPedidosParaActualizar() {
    const pedidos = await sequelize.query(
    `
        SELECT id, "eventoId"
        FROM "Pedidos" p
        WHERE p."repartidorId" IS NULL and estado = 'EnCamino' and "codigoEntrega" is NULL
          AND EXISTS (
              SELECT 1
              FROM "Asignacions" arp
              WHERE arp."PedidoId" = p.id
                AND arp.estado = 'Aceptado'
                AND arp."createdAt" >= NOW() - INTERVAL '${ASIGNACION_WINDOW_SECONDS} seconds'
          );
    `,
    { type: sequelize.QueryTypes.SELECT, logging: false }
  );

  return pedidos;
}

// Obtener repartidores ordenados por prioridad
const obtenerRepartidor = async (eventoId, pedidoId) => {
  try {
    // Ejecutar la función SQL para obtener el repartidor seleccionado
    const [results] = await sequelize.query(
      `
            SELECT seleccionar_repartidor_por_evento(:eventoId, :pedidoId) AS repartidor_id;
        `,
      {
        replacements: { eventoId, pedidoId },
        type: sequelize.QueryTypes.SELECT,
        logging: false,
      }
    );
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
    await sequelize.query(
      `
            DELETE FROM "Asignacions"
            WHERE estado = 'Pendiente'
              AND "createdAt" < NOW() - INTERVAL '${ASIGNACION_WINDOW_SECONDS} seconds'
            RETURNING *;
        `,
      { type: sequelize.QueryTypes.DELETE, logging: false }
    );

    //console.log('Asignaciones viejas pendientes eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones viejas pendientes:', error);
  }
}

// Borrar asignaciones rechazadas
export async function borrarAsignacionesCaducadas() {
  try {
    await sequelize.query(
      `
            DELETE FROM "Asignacions"
            WHERE estado='Caducado';
        `,
      { type: sequelize.QueryTypes.DELETE, logging: false }
    );

    //console.log('Asignaciones rechazadas eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones rechazadas:', error);
  }
}

// Borrar asignaciones rechazadas
export async function borrarAsignacionesRechazadas() {
  try {
    await sequelize.query(
      `
            DELETE FROM "Asignacions"
            WHERE estado = 'Rechazado';
        `,
      { type: sequelize.QueryTypes.DELETE, logging: false }
    );

    //console.log('Asignaciones rechazadas eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones rechazadas:', error);
  }
}

export async function caducarAsignaciones() {
  try {
    const [results] = await sequelize.query(
      `
      UPDATE "Asignacions"
      SET estado = 'Caducado'
      WHERE estado = 'Pendiente'
        AND "createdAt" < NOW() - INTERVAL '${ASIGNACION_WINDOW_SECONDS} seconds'
      RETURNING *;
    `,
      { type: sequelize.QueryTypes.UPDATE, logging: false }
    );

    //console.log(`${results.length} asignaciones caducadas actualizadas.`);
  } catch (error) {
    //console.error('Error al caducar asignaciones:', error);
  }
}
