import { sequelize } from '../util/connections.js';
import { consumidorService } from './consumidor.service.js';
import { encargadoService } from './encargado.service.js';
import { userService } from './users.service.js';

class EstadisticasService {
  async getTotalRecaudadoPorPuestoEnEvento(idevento) {
    try {
      let query = '';
      if (idevento === 'Todos') {
        query = `
        WITH top_puestos AS (
          SELECT 
            (SELECT "nombreCarro" FROM puestos WHERE id = "puestoId") AS nombre,
            "puestoId" AS idpuesto,
            COUNT(*) AS cantidadPedidos,
            ROUND(SUM(total)::numeric, 2) AS total
          FROM 
            public."Pedidos"
          WHERE 
            estado = 'Entregado' or estado = 'Valorado'
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
              estado = 'Entregado' or estado = 'Valorado'
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
      } else {
        query = `
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
            AND estado = 'Entregado' or estado = 'Valorado'
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
              AND estado = 'Entregado' or estado = 'Valorado'
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
      }

      const results = await sequelize.query(query, {
        replacements: { eventoId: idevento, eventoId: idevento, eventoId: idevento },
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
      let query = '';
      if (eventoId === 'Todos') {
        query = `
        SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
        FROM 
            public."Pedidos"
        WHERE 
            estado = 'Entregado' or estado = 'Valorado';
      `;
      } else {
        query = `
        SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
        FROM 
            public."Pedidos"
        WHERE 
            "eventoId" = :eventoId 
            AND estado = 'Entregado' or estado = 'Valorado';
      `;
      }

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

  async getPromedioValoracionPuesto(eventoId) {
    try {
      let query = '';
      if (eventoId === 'Todos') {
        query = `
        SELECT 
            AVG(vp.puntuacion) AS promedio_valoracion_puesto
        FROM 
            public."Pedidos" p
        JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
        JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
        WHERE 
            p.estado = 'Valorado'
        GROUP BY 
            p."eventoId";
      `;
      } else {
        query = `
        SELECT 
            AVG(vp.puntuacion) AS promedio_valoracion_puesto
        FROM 
            public."Pedidos" p
        JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
        JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
        WHERE 
            p.estado = 'Valorado'
            AND p."eventoId" = :eventoId
        GROUP BY 
            p."eventoId";
      `;
      }

      const result = await sequelize.query(query, {
        replacements: { eventoId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!result[0] || result[0].promedio_valoracion_puesto === null) {
        return 0; // Si no hay valoraciones, retornar 0
      }

      return parseFloat(result[0].promedio_valoracion_puesto); // Retorna el promedio
    } catch (error) {
      console.error('Error obteniendo el promedio de valoraciones del puesto:', error);
      throw new Error('Error al calcular el promedio de valoraciones del puesto');
    }
  }

  async getPedidosPorTiempoYCarrito(eventoId, puestoId) {
    try {
      if (!eventoId) {
        eventoId = 'Todos';
      }
      if (!puestoId) {
        puestoId = 'Todos';
      }
      let query = `
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
            (
                (:eventoId::text = 'Todos') OR 
                (d."eventoId"::text = :eventoId AND ped."eventoId"::text = :eventoId)
            )
            AND (
                (:puestoId::text = 'Todos') OR 
                (ped."puestoId"::text = :puestoId)
            )
            AND (ped.estado = 'Entregado' OR ped.estado = 'Valorado')
        GROUP BY 
            d."fechaHoraInicioDiaEvento", p."nombreCarro", ped."puestoId" -- Agrupar por día de evento y puesto
        ORDER BY 
            d."fechaHoraInicioDiaEvento", ped."puestoId", totalRecaudado DESC;
      `;
      const results = await sequelize.query(query, {
        replacements: { eventoId, puestoId },
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

  async getTotalRecaudadoPuestoEvento(idConsumidor, idPuesto, idEvento) {
    try {
      console.log(idConsumidor, idPuesto, idEvento);

      // Asegúrate de que `consumidorService.getOne` devuelva el objeto correctamente
      const consumidor = await consumidorService.getOne(idConsumidor);
      if (!consumidor || !consumidor.encargadoId) {
        return 0;
      }

      const idEncargado = consumidor.encargadoId; // Extrae el encargadoId
      let query = '';
      const replacements = { idEncargado }; // Asegúrate de que idEncargado se agregue aquí

      if (idPuesto === 'Todos' && idEvento === 'Todos') {
        query = `
          SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
          FROM 
            public."Pedidos"
          WHERE 
            "puestoId" IN (
              SELECT id 
              FROM Puestos 
              WHERE "encargadoId" = :idEncargado
            );
        `;
      } else if (idPuesto === 'Todos' && idEvento !== 'Todos') {
        query = `
          SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
          FROM 
            public."Pedidos"
          WHERE 
            "puestoId" IN (
              SELECT id 
              FROM Puestos
              WHERE "encargadoId" = :idEncargado
            ) 
            AND "eventoId" = :idEvento;
        `;
        replacements.idEvento = idEvento;
      } else if (idPuesto !== 'Todos' && idEvento === 'Todos') {
        query = `
          SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
          FROM 
            public."Pedidos"
          WHERE 
            "puestoId" = :idPuesto 
            AND "puestoId" IN (
              SELECT id 
              FROM Puestos
              WHERE "encargadoId" = :idEncargado
            );
        `;
        replacements.idPuesto = idPuesto;
      } else {
        query = `
          SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
          FROM 
            public."Pedidos"
          WHERE 
            "puestoId" = :idPuesto 
            AND "eventoId" = :idEvento 
            AND "puestoId" IN (
              SELECT id 
              FROM Puestos
              WHERE "encargadoId" = :idEncargado
            );
        `;
        replacements.idPuesto = idPuesto;
        replacements.idEvento = idEvento;
      }

      const result = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      });

      if (!result || result[0].totalrecaudado === null) {
        return 0; // Devuelve 0 si no hay resultados o si el total es null
      }

      return result[0].totalrecaudado;
    } catch (error) {
      console.error('Error obteniendo el total recaudado por puesto y evento:', error);
      throw new Error('Error al calcular el total recaudado.');
    }
  }

  async getPromedioValoracionPuestoEvento(idConsumidor, idPuesto, idEvento) {
    try {
      console.log(idConsumidor, idPuesto, idEvento);

      const consumidor = await consumidorService.getOne(idConsumidor);
      if (!consumidor || !consumidor.encargadoId) {
        return 0;
      }

      const idEncargado = consumidor.encargadoId;
      let query = '';
      const replacements = { idEncargado };

      if (idPuesto === 'Todos' && idEvento === 'Todos') {
        query = `
          SELECT 
            ROUND(AVG(vp.puntuacion) ,2) AS promedio_valoracion_puesto
          FROM 
            public."Pedidos" p
          JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
          JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
          WHERE 
            p.estado = 'Valorado'
        `;
      } else if (idPuesto === 'Todos' && idEvento !== 'Todos') {
        query = `
          SELECT 
            ROUND(AVG(vp.puntuacion) ,2) AS promedio_valoracion_puesto
          FROM 
            public."Pedidos" p
          JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
          JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
          WHERE 
            p.estado = 'Valorado'
            AND p."eventoId" = :idEvento
        `;
        replacements.idEvento = idEvento || null;
      } else if (idPuesto !== 'Todos' && idEvento === 'Todos') {
        query = `
          SELECT 
            ROUND(AVG(vp.puntuacion) ,2) AS promedio_valoracion_puesto
          FROM 
            public."Pedidos" p
          JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
          JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
          WHERE 
            p.estado = 'Valorado'
            AND p."puestoId" = :idPuesto
        `;
        replacements.idPuesto = idPuesto || null;
      } else {
        query = `
          SELECT 
            ROUND(AVG(vp.puntuacion) ,2) AS promedio_valoracion_puesto
          FROM 
            public."Pedidos" p
          JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
          JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
          WHERE 
            p.estado = 'Valorado'
            AND p."eventoId" = :idEvento
            AND p."puestoId" = :idPuesto
        `;
        replacements.idPuesto = idPuesto || null;
        replacements.idEvento = idEvento || null;
      }

      const result = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      });

      if (!result || result[0].promedio_valoracion_puesto === null) {
        return 0;
      }

      return result[0].promedio_valoracion_puesto;
    } catch (error) {
      console.error('Error obteniendo el promedio de valoración por puesto y evento:', error);
      throw new Error('Error al calcular el promedio de valoración.');
    }
  }

  async getTiempoPromedioEntrega(idConsumidor, idPuesto, idEvento) {
    try {
      console.log(idEvento, idPuesto);

      let query = '';
      const replacements = {};

      if (idPuesto === 'Todos' && idEvento === 'Todos') {
        query = `
          SELECT 
            ROUND(AVG(EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha"))) / 60, 2) AS tiempo_promedio_entrega_minutos
          FROM 
            public."Pedidos" p
          WHERE 
            (p.estado = 'Valorado' OR p.estado = 'Entregado')
            AND p."fechaEntrega" IS NOT NULL;
        `;
      } else if (idPuesto === 'Todos' && idEvento !== 'Todos') {
        query = `
          SELECT 
            ROUND(AVG(EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha"))) / 60, 2) AS tiempo_promedio_entrega_minutos
          FROM 
            public."Pedidos" p
          WHERE 
            (p.estado = 'Valorado' OR p.estado = 'Entregado')
            AND p."eventoId" = :idEvento
            AND p."fechaEntrega" IS NOT NULL;
        `;
        replacements.idEvento = idEvento || null;
      } else if (idPuesto !== 'Todos' && idEvento === 'Todos') {
        query = `
          SELECT 
            ROUND(AVG(EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha"))) / 60, 2) AS tiempo_promedio_entrega_minutos
          FROM 
            public."Pedidos" p
          WHERE 
            (p.estado = 'Valorado' OR p.estado = 'Entregado')
            AND p."puestoId" = :idPuesto
            AND p."fechaEntrega" IS NOT NULL;
        `;
        replacements.idPuesto = idPuesto || null;
      } else {
        query = `
          SELECT 
            ROUND(AVG(EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha"))) / 60, 2) AS tiempo_promedio_entrega_minutos
          FROM 
            public."Pedidos" p
          WHERE 
            (p.estado = 'Valorado' OR p.estado = 'Entregado')
            AND p."eventoId" = :idEvento
            AND p."puestoId" = :idPuesto
            AND p."fechaEntrega" IS NOT NULL;
        `;
        replacements.idPuesto = idPuesto || null;
        replacements.idEvento = idEvento || null;
      }

      const result = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      });

      if (!result || result[0].tiempo_promedio_entrega_minutos === null) {
        return 0;
      }

      return result[0].tiempo_promedio_entrega_minutos;
    } catch (error) {
      console.error('Error obteniendo el tiempo promedio de entrega:', error);
      throw new Error('Error al calcular el tiempo promedio de entrega.');
    }
  }

  async getTopProductosPorEventoYpuesto(eventoId, puestoId) {
    try {
      const query = `
      WITH TopProductos AS (
          -- Primeros 5 productos
          SELECT
              p.nombre AS Nombre,
              SUM(dp.cantidad) AS Pedidos,
              SUM(dp.cantidad * dp.precio) AS Dinero,
              ROW_NUMBER() OVER (ORDER BY SUM(dp.cantidad) DESC) AS RowNum
          FROM
              "DetallePedidos" dp
          JOIN
              "Pedidos" pe ON dp."PedidoId" = pe.id
          JOIN
              "productos" p ON dp."productoId" = p.id
          WHERE
              (CAST(:eventoId AS TEXT) = 'Todos' OR CAST(pe."eventoId" AS TEXT) = CAST(:eventoId AS TEXT))  -- Filtro condicional para eventoId
              AND (CAST(:puestoId AS TEXT) = 'Todos' OR CAST(pe."puestoId" AS TEXT) = CAST(:puestoId AS TEXT))  -- Filtro condicional para puestoId
              AND (pe."estado" = 'Entregado' OR pe."estado" = 'Valorado')
          GROUP BY
              p.id
      ),
      OtrosProductos AS (
          -- Otros productos (resto de los productos después de los primeros 5)
          SELECT
              'Otros Productos' AS Nombre,
              SUM(dp.cantidad) AS Pedidos,
              SUM(dp.cantidad * dp.precio) AS Dinero
          FROM
              "DetallePedidos" dp
          JOIN
              "Pedidos" pe ON dp."PedidoId" = pe.id
          JOIN
              "productos" p ON dp."productoId" = p.id
          WHERE
              (CAST(:eventoId AS TEXT) = 'Todos' OR CAST(pe."eventoId" AS TEXT) = CAST(:eventoId AS TEXT))  -- Filtro condicional para eventoId
              AND (CAST(:puestoId AS TEXT) = 'Todos' OR CAST(pe."puestoId" AS TEXT) = CAST(:puestoId AS TEXT))  -- Filtro condicional para puestoId
              AND (pe."estado" = 'Entregado' OR pe."estado" = 'Valorado')
              AND p.id NOT IN (
                  SELECT p.id
                  FROM "DetallePedidos" dp
                  JOIN "Pedidos" pe ON dp."PedidoId" = pe.id
                  JOIN "productos" p ON dp."productoId" = p.id
                  WHERE
                      (CAST(:eventoId AS TEXT) = 'Todos' OR CAST(pe."eventoId" AS TEXT) = CAST(:eventoId AS TEXT))  -- Filtro condicional para eventoId
                      AND (CAST(:puestoId AS TEXT) = 'Todos' OR CAST(pe."puestoId" AS TEXT) = CAST(:puestoId AS TEXT))  -- Filtro condicional para puestoId
                      AND (pe."estado" = 'Entregado' OR pe."estado" = 'Valorado')
                  GROUP BY p.id
                  ORDER BY SUM(dp.cantidad) DESC
                  LIMIT 5
              )
      )
      -- Unimos los primeros 5 productos con los otros productos
      SELECT
          Nombre,
          Pedidos,
          Dinero
      FROM
          TopProductos
      WHERE
          RowNum <= 5
      UNION ALL
      SELECT
          Nombre,
          Pedidos,
          Dinero
      FROM
          OtrosProductos;
      `;

      const result = await sequelize.query(query, {
        replacements: { eventoId, puestoId },
        type: sequelize.QueryTypes.SELECT,
      });

      return result;
    } catch (error) {
      console.error('Error obteniendo el top de productos por evento y puesto:', error);
      throw new Error('Error al calcular el top de productos');
    }
  }

  async getProductosVendidosDiaEvento(eventoId, puestoId, diaEvento) {
    try {
      const query = `
        WITH evento_horario AS (
            SELECT "fechaHoraInicioDiaEvento", "fechaHoraFinDiaEvento"
            FROM "diaEventos"
            WHERE (:eventoId::text = 'Todos' OR "eventoId"::text = :eventoId::text)
            AND DATE("fechaHoraInicioDiaEvento") = :diaEvento
        ),
        intervalos AS (
            SELECT generate_series(
                (SELECT MIN("fechaHoraInicioDiaEvento") FROM evento_horario), 
                (SELECT MAX("fechaHoraFinDiaEvento") FROM evento_horario), 
                INTERVAL '30 minutes'
            ) AS "intervalo_30min"
        ),
        pedidos_filtrados AS (
            SELECT p.id AS "pedidoId", p."fecha", p."puestoId"
            FROM "Pedidos" p
            JOIN evento_horario e 
                ON p."fecha" BETWEEN e."fechaHoraInicioDiaEvento" AND e."fechaHoraFinDiaEvento"
            WHERE (:eventoId::text = 'Todos' OR p."eventoId"::text = :eventoId::text)
            AND (:puestoId::text = 'Todos' OR p."puestoId"::text = :puestoId::text)
        ),
        productos_vendidos AS (
            SELECT DISTINCT dp."productoId"
            FROM "DetallePedidos" dp
            JOIN pedidos_filtrados p ON dp."PedidoId" = p."pedidoId"
            WHERE (:puestoId::text = 'Todos' OR p."puestoId"::text = :puestoId::text)
        ),
        ventas_agrupadas AS (
            SELECT 
                dp."productoId",
                p."puestoId",
                (SELECT i."intervalo_30min"
                 FROM intervalos i
                 ORDER BY ABS(EXTRACT(EPOCH FROM (i."intervalo_30min" - p."fecha"))) 
                 LIMIT 1
                ) AS "intervalo_30min",
                SUM(dp."cantidad") AS "cantidad_vendida"
            FROM "DetallePedidos" dp
            JOIN pedidos_filtrados p ON dp."PedidoId" = p."pedidoId"
            GROUP BY dp."productoId", p."puestoId", "intervalo_30min"
        )
        SELECT 
            i."intervalo_30min",
            pr."nombre" AS "producto",
            COALESCE(v."cantidad_vendida", 0) AS "cantidad_vendida"
        FROM intervalos i
        JOIN "productos" pr ON pr."id" IN (SELECT "productoId" FROM productos_vendidos)
        LEFT JOIN ventas_agrupadas v 
            ON i."intervalo_30min" = v."intervalo_30min"
            AND pr.id = v."productoId"
            AND (:puestoId::text = 'Todos' OR v."puestoId"::text = :puestoId::text)
        ORDER BY i."intervalo_30min", pr."nombre";
      `;
  
      const result = await sequelize.query(query, {
        replacements: { eventoId, puestoId, diaEvento },
        type: sequelize.QueryTypes.SELECT,
      });
  
      return result;
    } catch (error) {
      console.error('Error obteniendo las ventas agrupadas por intervalos de 30 minutos:', error);
      throw new Error('Error al obtener las ventas agrupadas');
    }
  }
  
}

export const estadisticasService = new EstadisticasService();
