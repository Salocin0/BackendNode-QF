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
      await borrarAsignacionesPendienteViejas(); // caducar
      const pedidos = await obtenerPedidosParaAsignacion();

      for (const pedido of pedidos) {
        const existeAsignacion = await verificarAsignacionPorPedido(pedido.id)
        //console.log(existeAsignacion)
        if(!existeAsignacion){
          const repartidor = await obtenerRepartidorParaAsignacion(pedido); // tener en cuenta las caducadas para no poner el mismo repartidor

          if (repartidor && repartidor.length > 0) {
            await asignacionService.create("Pendiente",pedido.id, repartidor[0].repartidoreId);
            //console.log(`Asignación creada para pedido ${pedido.id} con repartidor ${repartidor[0].repartidoreId}`);
          } else {
            //console.log(`No se encontró repartidor para el pedido ${pedido.id}`);
          }
        }
      }
    } catch (error) {
      //console.error('Error al asignar repartidores:', error);
    }
  });
}

export async function verificarAsignacionPorPedido(pedidoId) {
  try {
    const resultado = await sequelize.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM "Asignacions"
        WHERE "PedidoId" = :pedidoId
      ) AS "existe";
      `,
      {
        replacements: { pedidoId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return resultado[0].existe;
  } catch (error) {
    //console.error('Error al verificar asignación por pedido:', error);
    return false;
  }
}

export async function obtenerPedidosParaAsignacion() {
  /*const pedidos = await sequelize.query(
    `
    SELECT id
    FROM "Pedidos" p
    WHERE p."repartidorId" IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM "Asignacions" arp
        WHERE arp."PedidoId" = p.id
          AND arp.estado = 'Pendiente'
          AND arp."createdAt" >= NOW() - INTERVAL '45 seconds'
      );
  `,
    { type: sequelize.QueryTypes.SELECT }
  );*/

  return pedidos;
}

export async function obtenerRepartidorParaAsignacion() {
  /*const repartidor = await sequelize.query(
    `
    WITH 
Valoraciones_Calculadas AS (
    SELECT
        vr."repartidorId",
        COUNT(*) AS pedidosCalificados,
        AVG(vr.puntuacion) AS promedioPuntuacion
    FROM
        "valoracionRepartidors" vr
    GROUP BY
        vr."repartidorId"
),
-- Identificar repartidores con pedidos
Repartidores_Con_Pedidos AS (
    SELECT DISTINCT
        p."repartidorId"
    FROM
        "Pedidos" p
),
-- Identificar repartidores con asociaciones aceptadas o pendientes
Repartidores_Con_Asociaciones AS (
    SELECT DISTINCT
        a."repartidoreId"
    FROM
        "Asociacions" a
    WHERE
        a.estado IN ('Aceptado', 'Pendiente')
),
-- Obtener todos los repartidores
Todos_Repartidores AS (
    SELECT
        r.id AS "repartidoreId"
    FROM
        "repartidores" r
),
-- Clasificar repartidores en grupos de prioridad
Repartidores_Prioridad AS (
    SELECT
        r."repartidoreId",
        COALESCE(vc.pedidosCalificados, 0) AS pedidosCalificados,
        COALESCE(vc.promedioPuntuacion, 0) AS promedioPuntuacion,
        CASE
            WHEN r."repartidoreId" NOT IN (SELECT "repartidoreId" FROM Repartidores_Con_Pedidos)
                 AND r."repartidoreId" NOT IN (SELECT "repartidoreId" FROM Repartidores_Con_Asociaciones)
                 AND r."repartidoreId" NOT IN (SELECT "repartidoreId" FROM Valoraciones_Calculadas)
            THEN 1
            WHEN r."repartidoreId" IN (SELECT "repartidoreId" FROM Repartidores_Con_Pedidos)
                 AND r."repartidoreId" IN (SELECT "repartidoreId" FROM Repartidores_Con_Asociaciones)
                 AND r."repartidoreId" NOT IN (SELECT "repartidoreId" FROM Valoraciones_Calculadas)
            THEN 2
            ELSE 3
        END AS prioridad
    FROM
        Todos_Repartidores r
        LEFT JOIN Valoraciones_Calculadas vc ON r."repartidoreId" = vc."repartidorId"
),
-- Obtener repartidores que cumplen con los criterios y asignar prioridad
Repartidores_Ordenados AS (
    SELECT
        rp."repartidoreId",
        rp.pedidosCalificados,
        rp.promedioPuntuacion,
        rp.prioridad,
        CASE 
            WHEN rp.pedidosCalificados > 0 THEN rp.promedioPuntuacion / rp.pedidosCalificados 
            ELSE 0 
        END AS estrellas_por_pedido
    FROM
        Repartidores_Prioridad rp
    WHERE
        NOT EXISTS (
            SELECT 1
            FROM "Asignacions" arp
            WHERE arp."repartidoreId" = rp."repartidoreId"
              AND arp."estado" != 'Rechazado'
              AND arp."PedidoId" = 2
        )
)
-- Consulta final ordenando por prioridad y dentro del grupo 3 por estrellas_por_pedido
SELECT 
    "repartidoreId",
    prioridad,
    estrellas_por_pedido
FROM
    Repartidores_Ordenados ro
WHERE
    EXISTS (
        SELECT 1
        FROM "Asociacions" a
        WHERE a."eventoId" = 18
          AND a.estado = 'Aceptado'
          AND a."repartidoreId" = ro."repartidoreId"
    )
ORDER BY
    ro.prioridad,
    CASE
        WHEN ro.prioridad = 3 THEN ro.estrellas_por_pedido
        ELSE NULL
    END DESC;
  `,
    { type: sequelize.QueryTypes.SELECT }
  );*/

  return repartidor;
}

export async function borrarAsignacionesPendienteViejas() {
  try {
    /*await sequelize.query(
      `
      DELETE FROM "Asignacions"
      WHERE estado = 'Pendiente'
        AND "createdAt" < NOW() - INTERVAL '45 seconds'
      RETURNING *;
      `,
      { type: sequelize.QueryTypes.DELETE }
    );*/

    //console.log('Asignaciones viejas pendientes eliminadas.');
  } catch (error) {
    //console.error('Error al borrar asignaciones viejas pendientes:', error);
  }
}
