import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false;
const connectionString = process.env.DB_URL;

const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: sslOption,
      },
    })
  : new Sequelize({
      database: process.env.DB_NAME ? String(process.env.DB_NAME) : undefined,
      username: process.env.DB_USER ? String(process.env.DB_USER) : undefined,
      password: process.env.DB_PASSWORD != null ? String(process.env.DB_PASSWORD) : undefined,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      host: process.env.DB_HOST ? String(process.env.DB_HOST) : undefined,
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: sslOption,
      },
    });

// SQL para (re)crear la vista que alimenta al chatbot. Debe coincidir con la definición
// de Datos_DB.sql y con la usada en app.js (crearVistaChatbot). El nombre se deja sin
// comillas para que Postgres lo normalice a minúsculas (chatbotdata).
const CREATE_CHATBOT_VIEW_SQL = `
  CREATE OR REPLACE VIEW chatbotData AS
  SELECT ev.nombre,
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
  GROUP BY ev.id;
`;

// Consulta la vista chatbotData. Si no existe (Postgres 42P01) la crea y reintenta una vez.
async function consultarChatbotData() {
  try {
    const [results] = await sequelize.query('SELECT * FROM public.chatbotData;');
    return results;
  } catch (error) {
    const code = error?.parent?.code || error?.original?.code;
    const missingView = code === '42P01' || /does not exist/i.test(error?.message || '');
    if (!missingView) throw error;

    console.warn('La vista chatbotData no existe. Creándola y reintentando...');
    await sequelize.query(CREATE_CHATBOT_VIEW_SQL);
    const [results] = await sequelize.query('SELECT * FROM public.chatbotData;');
    return results;
  }
}

async function getChatResponse(userMessage) {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');


    // Refrescar la vista materializada
   //await sequelize.query("REFRESH MATERIALIZED VIEW public.chatbotData;");

    // Realizar consulta directa usando Sequelize.
    // La vista chatbotData puede no existir (al arrancar se eliminan todas las vistas del
    // schema public). Si Postgres responde 42P01 (relation does not exist) la creamos al
    // vuelo y reintentamos una vez, para que el chatbot sea auto-reparable.
    const results = await consultarChatbotData();


    const apiKey = process.env.CHATBOT_API_KEY;

    const openAIModel = new ChatOpenAI({
      apiKey: apiKey,
      modelName: 'gpt-3.5-turbo', // Puedes cambiar a 'gpt-4-turbo'
      temperature: 0,
      maxTokens: 150,
    });

    const template = new PromptTemplate({
      inputVariables: ['chatbotData', 'input'],
      template: `Olvida todas tus conversaciones pasadas. Ahora eres un asistente inteligente de una plataforma de eventos. Tienes acceso a la siguiente información sobre eventos y los carros de comida asociados a esos eventos: {chatbotData}. Tu tarea es responder con precisión y claridad a la siguiente pregunta de un usuario utilizando la información proporcionada:

                Pregunta del usuario: {input}

                Asegúrate de que tu respuesta sea con la información, respuesta CORTA y útil para el usuario. Si la información que se pide no está disponible, indícalo claramente y ofrece la alternativa de comunicarte con 'consultas@QF.com '.
                `,
    });

    const chain = new LLMChain({
      llm: openAIModel,
      prompt: template,
    });

    // Convertir los resultados en un formato legible
    const chatbotData = JSON.stringify(results);

    const response = await chain.call({ input: userMessage, chatbotData });
    return response.text;
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI:', error);
    throw error;
  }
}

export { getChatResponse };

