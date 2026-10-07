// SQL that (re)creates the view feeding the "Foody" chatbot. Single source of truth for app.js and util/chatbot.js.
// The name is left unquoted on purpose so Postgres folds it to lowercase (chatbotdata).
// Only events whose last day has not ended yet are exposed, whatever their stored state says.
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
         string_agg(DISTINCT ps."tipoNegocio"::text, ', '::text) AS "tipoNegocioLista"
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
