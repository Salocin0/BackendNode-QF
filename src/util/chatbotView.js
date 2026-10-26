// SQL that (re)creates the view feeding the "Foody" chatbot. Single source of truth for app.js and util/chatbot.js.
// The name is left unquoted on purpose so Postgres folds it to lowercase (chatbotdata).
// Only events whose last day has not ended yet are exposed, whatever their stored state says.
//
// Products are aggregated per puesto as a compact JSON array so the model can answer
// "what can I eat / how much is it" without the view growing one row per product.
// Only enabled products (estado = true) are exposed, matching what a consumer can buy.
export const CREATE_CHATBOT_VIEW_SQL = `
  CREATE OR REPLACE VIEW chatbotData AS
  SELECT ev.id,
         ev.nombre,
         ev.descripcion,
         ev."tipoEvento",
         (SELECT date(min(de."fechaHoraInicioDiaEvento"))
          FROM "diaEventos" de
          WHERE de."eventoId" = ev.id) AS "fechaInicioEvento",
         (SELECT date(max(de."fechaHoraFinDiaEvento"))
          FROM "diaEventos" de
          WHERE de."eventoId" = ev.id) AS "fechaFinEvento",
         ev."conButaca",
         ev."tienePreventa",
         ev."linkVentaEntradas",
         ev.ubicacion,
         ev.localidad,
         ev.provincia,
         ev.estado,
         string_agg(DISTINCT ps."nombreCarro"::text, ', '::text) AS "nombreCarroLista",
         string_agg(DISTINCT ps."tipoNegocio"::text, ', '::text) AS "tipoNegocioLista",
         (
           SELECT json_agg(
                    json_build_object(
                      'puesto', ps2."nombreCarro",
                      'productos', (
                        SELECT json_agg(
                                 json_build_object('nombre', pr.nombre, 'precio', pr.precio)
                                 ORDER BY pr.nombre
                               )
                        FROM productos pr
                        WHERE pr."puestoId" = ps2.id
                          AND pr.estado = true
                      )
                    )
                    ORDER BY ps2."nombreCarro"
                  )
           FROM puestos ps2
           WHERE ps2.id IN (
             SELECT ac2."puestoId"
             FROM "Asociacions" ac2
             WHERE ac2."eventoId" = ev.id
           )
         ) AS "carta"
  FROM eventos ev
       LEFT JOIN "Asociacions" ac ON ev.id = ac."eventoId"
       LEFT JOIN puestos ps ON ac."puestoId" = ps.id
  WHERE ev.estado IN ('EnCurso', 'Confirmado')
    AND COALESCE(
          (SELECT max(de."fechaHoraFinDiaEvento") FROM "diaEventos" de WHERE de."eventoId" = ev.id),
          ev."fechaHoraFin"
        ) >= now()
  GROUP BY ev.id;
`;
