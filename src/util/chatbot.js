import dotenv from 'dotenv';
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { sequelize } from './connections.js';
import { CREATE_CHATBOT_VIEW_SQL } from './chatbotView.js';
import { sanitizeExternalUrl } from './chatbotLinks.js';
import { normalizeChatInput } from './chatbotInput.js';
import { CHATBOT_PROMPT_TEMPLATE } from './chatbotPrompt.js';

dotenv.config();

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

/**
 * Enriches a raw chatbotData row so the model never has to build URLs itself:
 * - `link` points at the event detail page (always valid, built from the id).
 * - `linkVentaEntradas` is dropped when it is a dead placeholder, so the bot cannot
 *   offer a ticket link that does not open.
 */
export function enrichEvento(ev) {
  if (!ev || typeof ev !== 'object') return ev;
  const linkVenta = sanitizeExternalUrl(ev.linkVentaEntradas);
  const enriched = { ...ev, link: construirLinkEvento(ev.id) };
  if (linkVenta) {
    enriched.linkVentaEntradas = linkVenta;
  } else {
    delete enriched.linkVentaEntradas;
  }
  return enriched;
}

const SYSTEM_TEMPLATE = CHATBOT_PROMPT_TEMPLATE;

async function getChatResponse(userMessage) {
  const input = normalizeChatInput(userMessage);
  if (!input) {
    return 'Escribime tu consulta sobre los eventos y te ayudo.';
  }

  try {
    const results = await consultarChatbotData();
    const ayuda = await consultarAyuda();

    const eventosConLink = Array.isArray(results) ? results.map(enrichEvento) : results;

    const openAIModel = new ChatOpenAI({
      apiKey: process.env.CHATBOT_API_KEY,
      modelName: process.env.CHATBOT_MODEL || 'gpt-4o-mini',
      temperature: 0,
      // 300 truncated answers mid-sentence; 600 leaves room to finish a 4-sentence reply.
      maxTokens: Number(process.env.CHATBOT_MAX_TOKENS || 600),
    });

    const template = new PromptTemplate({
      inputVariables: ['chatbotData', 'ayuda', 'input'],
      template: SYSTEM_TEMPLATE,
    });

    const chain = new LLMChain({ llm: openAIModel, prompt: template });

    const response = await chain.call({
      input,
      chatbotData: JSON.stringify(eventosConLink),
      ayuda: JSON.stringify(ayuda),
    });
    return response.text;
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI:', error);
    throw error;
  }
}

export { getChatResponse };

