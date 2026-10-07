import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { CREATE_CHATBOT_VIEW_SQL } from './chatbotView.js';

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

// URL base del frontend para construir los links que sugiere el chatbot.
// Se toma de FRONTEND_URL; si no existe, del primer origen permitido en CORS_ORIGIN.
const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0].trim() : '') ||
  ''
).replace(/\/+$/, '');

// Construye el link de detalle (puestos del evento) para un id dado.
function construirLinkEvento(id) {
  if (id == null) return undefined;
  const base = FRONTEND_URL || '';
  return `${base}/listado-puestos/${id}`;
}


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

// Usage-help entries (how to order, register, pay...) stored by a migration in chatbot_ayuda.
async function consultarAyuda() {
  try {
    const [rows] = await sequelize.query('SELECT tema, pregunta, respuesta FROM chatbot_ayuda ORDER BY tema;');
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn('No se pudo leer chatbot_ayuda (continuando sin ayuda de uso):', error?.message || error);
    return [];
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
    const ayuda = await consultarAyuda();

    // Enriquecer cada evento con su link de detalle para que el modelo no invente URLs.
    const eventosConLink = Array.isArray(results)
      ? results.map((ev) => ({ ...ev, link: construirLinkEvento(ev.id) }))
      : results;

    const apiKey = process.env.CHATBOT_API_KEY;

    const openAIModel = new ChatOpenAI({
      apiKey: apiKey,
      modelName: 'gpt-4o-mini', // Puedes cambiar a 'gpt-4-turbo'
      temperature: 0,
      maxTokens: 300,
    });

    const template = new PromptTemplate({
      inputVariables: ['chatbotData', 'ayuda', 'input'],
      template: `Olvida todas tus conversaciones pasadas. Ahora eres "Foody", el asistente inteligente de QuickFood, una plataforma de eventos gastronómicos. Tienes acceso a la siguiente información de eventos y los carros de comida asociados (cada evento incluye un campo "link" con la URL para ver su detalle): {chatbotData}.

                Guía de uso de la plataforma (úsala para preguntas sobre cómo hacer un pedido, registrarse, pagar, el código de entrega o los roles): {ayuda}.

                Tu tarea es responder con precisión y claridad a la pregunta del usuario usando únicamente esa información.

                Reglas:
                - La respuesta debe ser CORTA, clara y útil.
                - Cuando menciones o sugieras un evento, incluí SIEMPRE su link en formato Markdown: [nombre del evento](link). Usá exactamente el valor del campo "link" del evento; no inventes ni modifiques URLs.
                - Si la información solicitada no está disponible, indicálo claramente y ofrecé la alternativa de comunicarse con 'consultas@QF.com'.

                Pregunta del usuario: {input}
                `,
    });

    const chain = new LLMChain({
      llm: openAIModel,
      prompt: template,
    });

    // Convertir los resultados en un formato legible
    const chatbotData = JSON.stringify(eventosConLink);

    const response = await chain.call({ input: userMessage, chatbotData, ayuda: JSON.stringify(ayuda) });
    return response.text;
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI:', error);
    throw error;
  }
}

export { getChatResponse };

