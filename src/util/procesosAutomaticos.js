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
      /*try {
          //await borrarAsignacionesPendienteViejas();
          await caducarAsignaciones();
          const pedidos = await obtenerPedidosParaAsignacion();
  
          for (const pedido of pedidos) {
              const existeAsignacion = await verificarAsignacionPorPedido(pedido.id);
  
              if (!existeAsignacion) {
                  const repartidor = await obtenerRepartidoresOrdenados(pedido.eventoId);
  
                  if (repartidor && repartidor.length > 0) {
                      await asignacionService.create("Pendiente", pedido.id, repartidor[0].repartidoreId);
                      console.log(`Asignación creada para pedido ${pedido.id} con repartidor ${repartidor[0].repartidoreId}`);
                  } else {
                      console.log(`No se encontró repartidor para el pedido ${pedido.id}`);
                      await borrarAsignacionesRechazadas();
                  }
              }
          }
      } catch (error) {
          console.error('Error al asignar repartidores:', error);
      }*/
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
const obtenerRepartidoresOrdenados = async (eventoId) => {
    const query = `
        WITH Repartidores_Sin_Pedidos AS (
 SELECT
                r.id AS "repartidoreId"
            FROM
                "repartidores" r
            WHERE
                r.id NOT IN (SELECT "repartidorId" FROM "Pedidos" WHERE "repartidorId" IS NOT NULL)
                AND r.id NOT IN (SELECT "repartidoreId" FROM "Asociacions" WHERE estado = 'Aceptado')
				        and r.id not in (select "repartidoreId" from "Asignacions" where estado = 'Caducado' or estado ='Cancelado')
                and r.id not in (select "repartidoreId" from "Pedidos" where estado = Entregado) 
                and r.id not in (select "repartidorId" from "valoracionRepartidors")
        ),
        Repartidores_Con_Pedidos AS (
            SELECT
                r.id AS "repartidoreId"
            FROM
                "repartidores" r
            WHERE
                r.id IN (SELECT "repartidorId" FROM "Pedidos" WHERE "repartidorId" IS NOT NULL)
                AND r.id IN (SELECT "repartidoreId" FROM "Asociacions" WHERE estado = 'Aceptado')
                and r.id not in (select "repartidoreId" from "Asignacions" where estado = 'Caducado' or estado ='Cancelado')
                and r.id not in (Repartidores_Sin_Pedidos.repartidoreId)
                and r.id in (select "repartidoreId" from "Pedidos" where estado = Entregado) 
        ),
        Repartidores_Con_Solo_Pedidos_calificados AS (
            SELECT
                r.id AS "repartidoreId"
            FROM
                "repartidores" r
            WHERE
                r.id IN (SELECT "repartidorId" FROM "Pedidos" WHERE "repartidorId" IS NOT NULL)
                AND r.id IN (SELECT "repartidoreId" FROM "Asociacions" WHERE estado = 'Aceptado')
                and r.id not in (select "repartidoreId" from "Asignacions" where estado = 'Caducado' or estado ='Cancelado')
                and r.id in (select "repartidorId" from "valoracionRepartidors")
        )
        SELECT 
            "repartidoreId",
            prioridad
        FROM (
            SELECT 
                rs."repartidoreId",
                1 AS prioridad
            FROM
                Repartidores_Sin_Pedidos rs
            WHERE
                NOT EXISTS (
                    SELECT 1
                    FROM "Asociacions" a
                    WHERE a."eventoId" = :eventoId  
                      AND a.estado = 'Aceptado'
                      AND a."repartidoreId" = rs."repartidoreId"
                )
            UNION
            SELECT 
                rp."repartidoreId",
                2 AS prioridad
            FROM
                Repartidores_Con_Pedidos rp
            WHERE
                NOT EXISTS (
                    SELECT 1
                    FROM "Asociacions" a
                    WHERE a."eventoId" = :eventoId  
                      AND a.estado = 'Aceptado'
                      AND a."repartidoreId" = rp."repartidoreId"
                )
            UNION
            SELECT 
                rr."repartidoreId",
                3 AS prioridad
            FROM
                Repartidores_Con_Solo_Pedidos_calificados rr
            WHERE
                NOT EXISTS (
                    SELECT 1
                    FROM "Asociacions" a
                    WHERE a."eventoId" = :eventoId
                      AND a.estado = 'Aceptado'
                      AND a."repartidoreId" = rr."repartidoreId"
                )
        ) AS Repartidores_Prioridad
        ORDER BY
            prioridad;
    `;

    const repartidores = await sequelize.query(query, {
        replacements: { eventoId },
        type: sequelize.QueryTypes.SELECT,
    });

    return repartidores;
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
