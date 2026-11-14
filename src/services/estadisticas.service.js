import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { sequelize } from '../util/connections.js';
import { consumidorService } from './consumidor.service.js';
import { encargadoService } from './encargado.service.js';
import { repartidorService } from './repartidor.service.js';
import { userService } from './users.service.js';
import { crearModeloOpenAI } from '../util/openaiModelo.js';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { construirContextoComparativo, construirMetodologia } from '../util/benchmarkEstadistico.js';
import { benchmarksExternos } from '../config/benchmarksExternos.js';

const REPORTE_MODELO_RESPALDO = 'gpt-4o';

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
            estado IN ('Entregado', 'Valorado')
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
              estado IN ('Entregado', 'Valorado')
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
            AND estado IN ('Entregado', 'Valorado')
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
              AND estado IN ('Entregado', 'Valorado')
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
            estado IN ('Entregado', 'Valorado');
      `;
      } else {
        query = `
        SELECT 
            ROUND(SUM(total)::numeric, 2) AS totalRecaudado
        FROM 
            public."Pedidos"
        WHERE 
            "eventoId" = :eventoId 
            AND estado IN ('Entregado', 'Valorado');
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
            ON ped."eventoId" = d."eventoId" -- Cada pedido solo cuenta en los días de su propio evento (con eventos simultáneos, "Todos" duplicaba pedidos)
            AND ped."fecha" BETWEEN d."fechaHoraInicioDiaEvento" AND d."fechaHoraFinDiaEvento" -- Relación entre pedidos y días del evento mediante el rango de fechas
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
            estado IN ('Entregado', 'Valorado')
            AND "puestoId" IN (
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
            estado IN ('Entregado', 'Valorado')
            AND "puestoId" IN (
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
            estado IN ('Entregado', 'Valorado')
            AND "puestoId" = :idPuesto 
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
            estado IN ('Entregado', 'Valorado')
            AND "puestoId" = :idPuesto 
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

  async getEstadisticasConsumidor(consumidorid) {
    try {
      let query = `
        SELECT 
            (SELECT COUNT(DISTINCT "eventoId") 
             FROM "Pedidos" 
             WHERE "consumidorId" = :consumidorid) AS total_eventos,
  
            (SELECT COUNT(*) 
             FROM "Pedidos" 
             WHERE "consumidorId" = :consumidorid) AS total_pedidos,
  
            (SELECT COALESCE(SUM(dp."cantidad" * pr."precio"), 0) 
             FROM "Pedidos" p
             JOIN "DetallePedidos" dp ON p."id" = dp."PedidoId"
             JOIN "productos" pr ON dp."productoId" = pr."id"
             WHERE p."consumidorId" = :consumidorid) AS total_gastado;
      `;
  
      const results = await sequelize.query(query, {
        replacements: { consumidorid },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (results.length === 0) {
        return 0;
      }
  
      return results[0]; // Devolver solo el objeto con las estadísticas
    } catch (error) {
      console.error('Error obteniendo estadísticas del consumidor:', error);
      throw new Error('Error al calcular estadísticas del consumidor');
    }
  }
  

  async getEstadisticasRepartidor(consumidorid) {
    try {
      const consumidor = await consumidorService.getOne(consumidorid);

      const repartidorid= consumidor.repartidorId;
      let query = `
        SELECT 
            (SELECT COUNT(DISTINCT "eventoId") 
             FROM "Pedidos" 
             WHERE "repartidorId" = :repartidorid) AS eventos_participados,
  
            (SELECT COUNT(*) 
             FROM "Pedidos" 
             WHERE "repartidorId" = :repartidorid AND estado IN ('Entregado', 'Valorado')) AS pedidos_entregados;
      `;
  
      const results = await sequelize.query(query, {
        replacements: { repartidorid },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (results.length === 0) {
        return 0;
      }
  
      return results[0]; // Devuelve solo el objeto con las estadísticas
    } catch (error) {
      console.error('Error obteniendo estadísticas del repartidor:', error);
      throw new Error('Error al calcular estadísticas del repartidor');
    }
  }

  async getEstadisticasProductor(consumidorid) {
    try {
      const consumidor = await consumidorService.getOne(consumidorid);
      const productorid = consumidor?.productorId;
      if (!productorid) return { total_eventos: 0, total_recaudado: 0 };
      const results = await sequelize.query(
        `
        SELECT
          (SELECT COUNT(*) FROM eventos WHERE "productorId" = :productorid) AS total_eventos,
          (SELECT COALESCE(ROUND(SUM(p.total)::numeric, 2), 0)
             FROM "Pedidos" p
             JOIN eventos e ON e.id = p."eventoId"
            WHERE e."productorId" = :productorid
              AND p.estado IN ('Entregado', 'Valorado')) AS total_recaudado;
      `,
        { replacements: { productorid }, type: sequelize.QueryTypes.SELECT }
      );
      return results[0] || { total_eventos: 0, total_recaudado: 0 };
    } catch (error) {
      console.error('Error obteniendo estadísticas del productor:', error);
      throw new Error('Error al calcular estadísticas del productor');
    }
  }

  async getPuestosConPedidos(idConsumidor) {
    try {
      const consumidor = await consumidorService.getOne(idConsumidor);
      if (!consumidor || !consumidor.encargadoId) {
        return [];
      }

      const query = `
        SELECT DISTINCT p.id, p."nombreCarro", p."numeroCarro", p."tipoNegocio", p."telefonoCarro", p."estado"
        FROM "puestos" p
        INNER JOIN "Pedidos" ped ON ped."puestoId" = p.id
        WHERE p."encargadoId" = :encargadoId
        AND p."estado" = 'Creado'
        AND (ped.estado = 'Entregado' OR ped.estado = 'Valorado')
      `;

      const results = await sequelize.query(query, {
        replacements: { encargadoId: consumidor.encargadoId },
        type: sequelize.QueryTypes.SELECT,
      });

      return results;
    } catch (error) {
      console.error('Error obteniendo puestos con pedidos:', error);
      throw new Error('Error al obtener puestos con pedidos');
    }
  }

  async getEventosConPedidos(idConsumidor) {
    try {
      const consumidor = await consumidorService.getOne(idConsumidor);
      if (!consumidor || !consumidor.encargadoId) {
        return [];
      }

      const query = `
        SELECT e.id, e.nombre
        FROM "eventos" e
        INNER JOIN "Pedidos" ped ON ped."eventoId" = e.id
        INNER JOIN "puestos" p ON p.id = ped."puestoId"
        WHERE p."encargadoId" = :encargadoId
        AND ped.estado IN ('Entregado', 'Valorado')
        GROUP BY e.id, e.nombre, e."fechaHoraInicio"
        ORDER BY e."fechaHoraInicio" ASC, e.id ASC
      `;

      const results = await sequelize.query(query, {
        replacements: { encargadoId: consumidor.encargadoId },
        type: sequelize.QueryTypes.SELECT,
      });

      return results;
    } catch (error) {
      console.error('Error obteniendo eventos con pedidos:', error);
      throw new Error('Error al obtener eventos con pedidos');
    }
  }

  // Una fila por (evento, puesto): base del benchmark interno.
  async getUnidadesComparables() {
    return sequelize.query(
      `
      WITH ped AS (
        SELECT p."eventoId", p."puestoId",
          COUNT(*)::int AS pedidos,
          SUM(p.total)::float AS recaudado,
          (AVG(EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha")) / 60) FILTER (WHERE p."fechaEntrega" IS NOT NULL))::float AS entrega,
          COUNT(p."fechaEntrega")::int AS entregas
        FROM public."Pedidos" p
        WHERE p.estado IN ('Entregado', 'Valorado') AND p."eventoId" IS NOT NULL AND p."puestoId" IS NOT NULL
        GROUP BY p."eventoId", p."puestoId"
      ),
      val AS (
        SELECT p."eventoId", p."puestoId", AVG(v.puntuacion)::float AS valoracion, COUNT(v.puntuacion)::int AS valoraciones
        FROM public."valoracionPuestos" v
        JOIN public."Pedidos" p ON p.id = v."pedidoId"
        WHERE v.puntuacion IS NOT NULL
        GROUP BY p."eventoId", p."puestoId"
      )
      SELECT ped."eventoId", ped."puestoId", ped.pedidos, ped.recaudado, ped.entrega, ped.entregas,
        val.valoracion, COALESCE(val.valoraciones, 0) AS valoraciones,
        pu."encargadoId", e."tipoEvento", e."capacidadMaxima"
      FROM ped
      LEFT JOIN val ON val."eventoId" = ped."eventoId" AND val."puestoId" = ped."puestoId"
      JOIN public.puestos pu ON pu.id = ped."puestoId"
      JOIN public.eventos e ON e.id = ped."eventoId";
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
  }

  async getDistribucionEntrega({ idEvento, idPuesto, idEncargado }) {
    const filtros = [];
    const replacements = {};
    if (idEvento && idEvento !== 'Todos') {
      filtros.push('AND p."eventoId" = :idEvento');
      replacements.idEvento = idEvento;
    }
    if (idPuesto && idPuesto !== 'Todos') {
      filtros.push('AND p."puestoId" = :idPuesto');
      replacements.idPuesto = idPuesto;
    }
    if (idEncargado) {
      filtros.push('AND p."puestoId" IN (SELECT id FROM public.puestos WHERE "encargadoId" = :idEncargado)');
      replacements.idEncargado = idEncargado;
    }
    const [row] = await sequelize.query(
      `
      SELECT COUNT(*)::int AS n,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY m) AS mediana,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY m) AS p90
      FROM (
        SELECT EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha")) / 60 AS m
        FROM public."Pedidos" p
        WHERE p.estado IN ('Entregado', 'Valorado') AND p."fechaEntrega" IS NOT NULL
        ${filtros.join('\n        ')}
      ) t;
      `,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
    return row || null;
  }

  async getNombreFiltro(tabla, columna, id, valorTodos) {
    if (!id || id === 'Todos') return valorTodos;
    try {
      const [row] = await sequelize.query(`SELECT "${columna}" AS nombre FROM ${tabla} WHERE id = :id LIMIT 1`, {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      });
      return row?.nombre || (tabla === 'eventos' ? 'Evento seleccionado' : 'Puesto seleccionado');
    } catch {
      return tabla === 'eventos' ? 'Evento seleccionado' : 'Puesto seleccionado';
    }
  }

  async getAnalisisLLM(tipo, idConsumidor, idEvento, idPuesto) {
    try {
      let statsData = {};
      const nombreEvento = await this.getNombreFiltro('eventos', 'nombre', idEvento, 'Todos los eventos');
      const sinIds = (rows) =>
        (rows || []).map((r) =>
          Object.fromEntries(Object.entries(r).filter(([k]) => !/^id|Id$/.test(k)))
        );

      if (tipo === 'encargado') {
        const [totalRecaudado, valoracion, tiempoPromedio, topProductos] = await Promise.allSettled([
          this.getTotalRecaudadoPuestoEvento(idConsumidor, idPuesto, idEvento),
          this.getPromedioValoracionPuestoEvento(idConsumidor, idPuesto, idEvento),
          this.getTiempoPromedioEntrega(idConsumidor, idPuesto, idEvento),
          this.getTopProductosPorEventoYpuesto(idEvento, idPuesto),
        ]);

        statsData = {
          rol: 'Encargado de Puesto',
          filtros: {
            evento: nombreEvento,
            puesto: await this.getNombreFiltro('puestos', 'nombreCarro', idPuesto, 'Todos los puestos'),
          },
          totalRecaudado: totalRecaudado.status === 'fulfilled' ? totalRecaudado.value : 'Sin datos',
          valoracionPromedio: valoracion.status === 'fulfilled' ? valoracion.value : 'Sin datos',
          tiempoPromedioEntregaMinutos: tiempoPromedio.status === 'fulfilled' ? tiempoPromedio.value : 'Sin datos',
          topProductos: topProductos.status === 'fulfilled' ? sinIds(topProductos.value).slice(0, 5) : [],
        };
      } else if (tipo === 'productor') {
        const [totalRecaudado, valoracion, topPuestos] = await Promise.allSettled([
          this.getTotalRecaudadoEvento(idEvento),
          this.getPromedioValoracionPuesto(idEvento),
          this.getTotalRecaudadoPorPuestoEnEvento(idEvento),
        ]);

        statsData = {
          rol: 'Productor de Evento',
          filtros: {
            evento: nombreEvento,
          },
          totalRecaudado: totalRecaudado.status === 'fulfilled' ? totalRecaudado.value : 'Sin datos',
          valoracionPromedio: valoracion.status === 'fulfilled' ? valoracion.value : 'Sin datos',
          topPuestos: topPuestos.status === 'fulfilled' ? sinIds(topPuestos.value).slice(0, 5) : [],
        };
      }

      let contextoComparativo = { alcance: {}, comparaciones: [], concentracion: null, advertencias: [] };
      let distribucionEntrega = null;
      try {
        const idEncargado =
          tipo === 'encargado' ? (await consumidorService.getOne(idConsumidor))?.encargadoId ?? null : null;
        const [filas, distribucion] = await Promise.all([
          this.getUnidadesComparables(),
          this.getDistribucionEntrega({ idEvento, idPuesto: tipo === 'encargado' ? idPuesto : 'Todos', idEncargado }),
        ]);
        contextoComparativo = construirContextoComparativo({ tipo, filas, idEvento, idPuesto, idEncargado });
        distribucionEntrega = distribucion;
        if (distribucion?.n) {
          contextoComparativo.distribucionEntregaMinutos = {
            pedidosMedidos: distribucion.n,
            mediana: Math.round(Number(distribucion.mediana) * 10) / 10,
            percentil90: Math.round(Number(distribucion.p90) * 10) / 10,
          };
        }
      } catch (error) {
        console.error('Error calculando el contexto comparativo:', error);
        contextoComparativo.advertencias.push('No se pudo calcular la comparación interna; no califiques las métricas.');
      }

      const metodologia = construirMetodologia({
        contexto: contextoComparativo,
        distribucionEntrega,
        benchmarksExternos,
        fechaCorte: new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
      });

      // Report model: a reasoning model thinks more before writing (REPORTE_MODEL /
      // REPORTE_REASONING_EFFORT). If OpenAI rejects it (e.g. the key has no access),
      // the report falls back to gpt-4o so it is still generated.
      const modeloReporte = process.env.REPORTE_MODEL || 'gpt-6-luna';
      const crearModeloReporte = (modelName) =>
        crearModeloOpenAI({
          modelName,
          maxTokens: 1400,
          temperature: 0.2,
          reasoningEffort: process.env.REPORTE_REASONING_EFFORT || 'medium',
          reasoningBudget: 6000,
        });

      const template = new PromptTemplate({
        inputVariables: ['statsData', 'contexto', 'benchmarks'],
        template: `Sos un analista de negocios gastronómicos en eventos. Redactás un informe para QuickFood basándote EXCLUSIVAMENTE en los datos de abajo.

MÉTRICAS DEL PANEL:
{statsData}

CONTEXTO COMPARATIVO INTERNO (calculado por QuickFood con su histórico):
{contexto}

BENCHMARKS EXTERNOS VERIFICADOS (única referencia externa permitida):
{benchmarks}

REGLAS DE RIGOR (obligatorias):
1. No inventes estándares, promedios "del sector", rangos típicos ni cifras que no estén arriba. Si un dato no está, no lo supongas.
2. Para calificar una métrica (bueno, malo, eficiente, excelente, alto, bajo, etc.) solo podés basarte en:
   a) una comparación del contexto interno, citando la referencia, la cantidad de unidades y el percentil (ej.: "ubica en el percentil 82 frente a 14 puestos de otros eventos de QuickFood"), usando la "lectura" provista; o
   b) un benchmark externo, citándolo como "(Fuente: <fuente>, <año>)" y aclarando su comparabilidad si no es del mismo segmento o escala.
   Si una métrica no tiene base comparativa, describila sin calificarla e indicá que no hay referencia disponible.
3. Las advertencias de muestra deben aparecer en RIESGOS Y ALERTAS.
4. Cada oportunidad y recomendación debe apoyarse en un dato concreto citado del informe.
5. Referite a eventos, puestos y productos por su nombre; nunca menciones IDs ni identificadores numéricos.
6. Los montos están en pesos argentinos: escribilos con formato $ 1.234.567.
7. Concentración de recaudación entre puestos: usá únicamente la concentración calculada en el contexto comparativo. No menciones nombres de campos ni hables de una "medición formal". Si no está disponible y el alcance contiene un solo puesto con pedidos entregados, explicá en una frase que no aplica porque no hay otros puestos en el alcance para comparar. Si no está disponible por falta de datos, recaudación o por un error, indicá que no se pudo calcular, sin atribuirlo a un único puesto. No calcules ni estimes concentración por tu cuenta, tampoco a partir de los productos más vendidos.

Generá el informe en español con estas secciones, con títulos en MAYÚSCULAS:

RESUMEN EJECUTIVO
(2-3 oraciones con los puntos clave)

ANÁLISIS DE RENDIMIENTO
(En el PDF esta sección empieza con un gráfico que ubica cada métrica del contexto comparativo dentro del rango de su referencia: mínimo-máximo, franja P25-P75, mediana y el valor propio coloreado según su lectura. Tu texto va debajo del gráfico y lo explica: recorré las métricas del gráfico indicando dónde se ubica cada valor frente a la mediana y su percentil, y qué significa para el negocio. Después sumá recaudación y productos/puestos top. Aplicá las reglas de rigor y no repitas cifras sin interpretarlas)

OPORTUNIDADES DETECTADAS
(2-3 oportunidades basadas en los datos)

RIESGOS Y ALERTAS
(Métricas desfavorables, concentración de ventas (según la regla 7) y limitaciones de muestra; si no hay, indicalo)

RECOMENDACIONES ESTRATÉGICAS
(3-5 acciones concretas y priorizadas)

Tono profesional pero accesible. No uses markdown como asteriscos o #.`,
      });

      const variables = {
        statsData: JSON.stringify(statsData, null, 2),
        contexto: JSON.stringify(contextoComparativo, null, 2),
        benchmarks: benchmarksExternos.length ? JSON.stringify(benchmarksExternos, null, 2) : 'Ninguno cargado.',
      };
      const generar = (modelName) => new LLMChain({ llm: crearModeloReporte(modelName), prompt: template }).call(variables);
      let response;
      try {
        response = await generar(modeloReporte);
      } catch (errorModelo) {
        if (modeloReporte === REPORTE_MODELO_RESPALDO) throw errorModelo;
        console.warn(`El modelo ${modeloReporte} falló para el reporte; reintentando con ${REPORTE_MODELO_RESPALDO}:`, errorModelo?.message || errorModelo);
        response = await generar(REPORTE_MODELO_RESPALDO);
      }

      return {
        analisis: response.text,
        estadisticas: statsData,
        contextoComparativo,
        metodologia,
      };
    } catch (error) {
      console.error('Error generando análisis LLM:', error);
      throw new Error('Error al generar el análisis con IA');
    }
  }
}

export const estadisticasService = new EstadisticasService();
