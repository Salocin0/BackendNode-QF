import { sequelize } from '../util/connections.js';

class EstadisticasService {
  async getTotalRecaudadoPorPuestoEnEvento(idevento) {
    try {
      const query = `
        WITH top_puestos AS (
          SELECT 
            (SELECT "nombreCarro" FROM puestos WHERE id = "puestoId") AS nombre,
            "puestoId" AS idpuesto,
            COUNT(*) AS cantidadPedidos,
            ROUND(SUM(total)::numeric, 2) AS total
          FROM 
            public."Pedidos"
          WHERE 
            "eventoId" = :eventoId 
            AND estado = 'Entregado'
          GROUP BY 
            "puestoId"
          ORDER BY 
            total DESC
          LIMIT 5
        ),
        otros_puestos AS (
          SELECT 
            'Otros Puestos' AS nombre,
            NULL::integer AS idpuesto, -- Convertir NULL al tipo integer
            SUM(cantidadPedidos) AS cantidadPedidos,
            ROUND(SUM(total)::numeric, 2) AS total
          FROM (
            SELECT 
              "puestoId",
              COUNT(*) AS cantidadPedidos,
              SUM(total) AS total
            FROM 
              public."Pedidos"
            WHERE 
              "eventoId" = :eventoId 
              AND estado = 'Entregado'
            GROUP BY 
              "puestoId"
            ORDER BY 
              total DESC
            OFFSET 5
          ) AS subquery
        )
        -- Devolver los resultados según la cantidad de puestos
        SELECT * FROM top_puestos
        UNION ALL
        SELECT * FROM otros_puestos
        WHERE otros_puestos.total is not null;
      `;

      const results = await sequelize.query(query, {
        replacements: { eventoId: idevento,eventoId: idevento,eventoId: idevento },
        type: sequelize.QueryTypes.SELECT,
      });

      return results;
    } catch (error) {
      console.error('Error ejecutando la consulta:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }
  async getTotalRecaudadoEvento(eventoId) {
    try {
      const query = `
        SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
        FROM 
            public."Pedidos"
        WHERE 
            "eventoId" = :eventoId 
            AND estado = 'Entregado';
      `;

      const result = await sequelize.query(query, {
        replacements: { eventoId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (result[0].totalrecaudado === null) {
        return 0;
      }

      return result[0].totalrecaudado;
    } catch (error) {
      console.error('Error obteniendo el total recaudado del evento:', error);
      throw new Error('Error al calcular el total recaudado');
    }
  }

  async getPedidosPorTiempoYCarrito(eventoId) {
    try {
      const query = `
        SELECT 
            d."fechaHoraInicioDiaEvento" AS diaEvento, -- Fecha específica del día del evento
            p."nombreCarro" AS nombrePuesto, -- Nombre del puesto
            ped."puestoId", -- ID del puesto
            COUNT(ped.id) AS cantidadPedidos, -- Número total de pedidos por día y puesto
            ROUND(SUM(ped.total)::numeric, 2) AS totalRecaudado -- Monto total recaudado por día y puesto
        FROM 
            public."Pedidos" ped
        JOIN 
            public."diaEventos" d 
            ON ped."fecha" BETWEEN d."fechaHoraInicioDiaEvento" AND d."fechaHoraFinDiaEvento" -- Relación entre pedidos y días del evento mediante el rango de fechas
        JOIN 
            public."puestos" p 
            ON ped."puestoId" = p.id -- Relación entre pedidos y puestos
        WHERE 
            d."eventoId" = :eventoId  -- ID del evento en particular
            AND ped.estado = 'Entregado' and ped."eventoId"=:eventoId  -- Solo considerar pedidos entregados
        GROUP BY 
            d."fechaHoraInicioDiaEvento", p."nombreCarro", ped."puestoId" -- Agrupar por día de evento y puesto
        ORDER BY 
            d."fechaHoraInicioDiaEvento",ped."puestoId", totalRecaudado DESC;
      `;

      const results = await sequelize.query(query, {
        replacements: { eventoId, eventoId },
        type: sequelize.QueryTypes.SELECT,
      });
      if (results.length === 0) {
        return 0;
      }

      return results;
    } catch (error) {
      console.error('Error obteniendo pedidos por tiempo y carrito:', error);
      throw new Error('Error al calcular pedidos por tiempo y carrito');
    }
  }
}

export const estadisticasService = new EstadisticasService();
