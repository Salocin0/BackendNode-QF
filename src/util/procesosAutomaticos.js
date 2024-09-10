import cron from 'node-cron';
import { asignacionService } from '../services/asignacion.service.js';
import { sequelize } from './connections.js';

export function procesosAutomaticos() {
  cron.schedule('* * * * *', () => {
    // cada minuto
    //Empezar los eventos
    //Asignar repartidores a pedidos
  });
  cron.schedule('*/5 * * * * *', async () => {
      try {
          await caducarAsignaciones();
          const pedidos = await obtenerPedidosParaAsignacion();
  
          for (const pedido of pedidos) {
              const existeAsignacion = await verificarAsignacionPorPedido(pedido.id);
  
              if (!existeAsignacion) {
                const repartidorid = await obtenerRepartidor(pedido.eventoId,pedido.id)
                if(repartidorid.repartidoreId===-2){
                    console.log("error al asignar repartidor")
                }
                if(repartidorid.repartidoreId===-1){
                    await borrarAsignacionesRechazadas();
                } else{
                    if (repartidorid.repartidoreId) {
                        console.log(`Asignación creada para pedido ${pedido.id} con repartidor ${repartidorid}`);
                        await asignacionService.create("Pendiente", pedido.id, repartidorid.repartidoreId);
                        
                    }
                }
              }
          }
      } catch (error) {
          console.error('Error al asignar repartidores:', error);
      }
  });
 
}

 
  // Verificar si un pedido ya tiene una asignación aceptada
  export async function verificarAsignacionPorPedido(pedidoId) {
    try {
        const resultado = await sequelize.query(`
            SELECT EXISTS (
                SELECT 1
                FROM "Asignacions"
                WHERE "PedidoId" = :pedidoId
                  AND (estado = 'Aceptado' or estado = 'Pendiente')
            ) AS "existe";
        `, {
            replacements: { pedidoId },
            type: sequelize.QueryTypes.SELECT
        });

        return resultado[0].existe;
    } catch (error) {
        console.error('Error al verificar asignación por pedido:', error);
        return false;
    }
}

// Obtener pedidos que necesitan asignación
export async function obtenerPedidosParaAsignacion() {
    const pedidos = await sequelize.query(`
        SELECT id, "eventoId"
        FROM "Pedidos" p
        WHERE p."repartidorId" IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM "Asignacions" arp
              WHERE arp."PedidoId" = p.id
                AND arp.estado = 'Pendiente'
                AND arp."createdAt" >= NOW() - INTERVAL '45 seconds'
          );
    `, { type: sequelize.QueryTypes.SELECT });

    return pedidos;
}

// Obtener repartidores ordenados por prioridad
const obtenerRepartidor = async (eventoId, pedidoId) => {
    try {
        // Ejecutar la función SQL para obtener el repartidor seleccionado
        const [results] = await sequelize.query(`
            SELECT seleccionar_repartidor_por_evento(:eventoId, :pedidoId) AS repartidor_id;
        `, {
            replacements: { eventoId, pedidoId },
            type: sequelize.QueryTypes.SELECT
        });
        console.log("resultados",results)

        // Verificar si se encontró un repartidor
        const repartidorId = results.repartidor_id;
        if (repartidorId === -1) {
            console.log(`No hay repartidores disponibles para el evento ${eventoId} y pedido ${pedidoId}`);
            return -1;
        } else {
            return {
                repartidoreId: repartidorId
            };
        }
    } catch (error) {
        console.error('Error al obtener repartidor:', error);
        return -2;
    }
};

// Borrar asignaciones pendientes viejas
export async function borrarAsignacionesPendienteViejas() {
    try {
        await sequelize.query(`
            DELETE FROM "Asignacions"
            WHERE estado = 'Pendiente'
              AND "createdAt" < NOW() - INTERVAL '45 seconds'
            RETURNING *;
        `, { type: sequelize.QueryTypes.DELETE });

        console.log('Asignaciones viejas pendientes eliminadas.');
    } catch (error) {
        console.error('Error al borrar asignaciones viejas pendientes:', error);
    }
}

// Borrar asignaciones rechazadas
export async function borrarAsignacionesRechazadas() {
    try {
        await sequelize.query(`
            DELETE FROM "Asignacions"
            WHERE estado = 'Rechazado' or estado='Caducado'
            RETURNING *;
        `, { type: sequelize.QueryTypes.DELETE });

        console.log('Asignaciones rechazadas eliminadas.');
    } catch (error) {
        console.error('Error al borrar asignaciones rechazadas:', error);
    }
}

export async function caducarAsignaciones() {
  try {
    const [results] = await sequelize.query(`
      UPDATE "Asignacions"
      SET estado = 'Caducado'
      WHERE estado = 'Pendiente'
        AND "createdAt" < NOW() - INTERVAL '45 seconds'
      RETURNING *;
    `, { type: sequelize.QueryTypes.UPDATE });

    console.log(`${results.length} asignaciones caducadas actualizadas.`);
  } catch (error) {
    console.error('Error al caducar asignaciones:', error);
  }
}
