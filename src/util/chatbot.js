import dotenv from 'dotenv';
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { sequelize } from './connections.js';
import { CREATE_CHATBOT_VIEW_SQL } from './chatbotView.js';
import { sanitizeExternalUrl, enlazarCarta } from './chatbotLinks.js';
import { normalizeChatInput } from './chatbotInput.js';
import { CHATBOT_PROMPT_TEMPLATE } from './chatbotPrompt.js';
import { cerrarRespuestaCortada, cierreDeStreamCortado } from './chatbotText.js';
import { normalizarHistorial, formatearHistorial } from './chatbotHistorial.js';


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
 * - every puesto/product in `carta` gets its own `link` (see enlazarCarta).
 * - `linkVentaEntradas` is dropped when it is a dead placeholder, so the bot cannot
 *   offer a ticket link that does not open.
 */
export function enrichEvento(ev) {
  if (!ev || typeof ev !== 'object') return ev;
  const linkVenta = sanitizeExternalUrl(ev.linkVentaEntradas);
  const enriched = {
    ...ev,
    link: construirLinkEvento(ev.id),
    carta: enlazarCarta(ev.carta, ev.id, FRONTEND_URL || ''),
  };
  if (linkVenta) {
    enriched.linkVentaEntradas = linkVenta;
  } else {
    delete enriched.linkVentaEntradas;
  }
  return enriched;
}

const SYSTEM_TEMPLATE = CHATBOT_PROMPT_TEMPLATE;
const MENSAJE_VACIO = 'Escribime tu consulta sobre los eventos y te ayudo.';

async function construirPrompt(input, historial = []) {
  const results = await consultarChatbotData();
  const ayuda = await consultarAyuda();
  const eventosConLink = Array.isArray(results) ? results.map(enrichEvento) : results;
  const template = new PromptTemplate({
    inputVariables: ['chatbotData', 'ayuda', 'input', 'historial'],
    template: SYSTEM_TEMPLATE,
  });
  return template.format({
    input,
    chatbotData: JSON.stringify(eventosConLink),
    ayuda: JSON.stringify(ayuda),
    historial: formatearHistorial(historial),
  });
}

/**
 * Builds the chat model from CHATBOT_MODEL. Reasoning models (o-series, gpt-5*, gpt-6*)
 * reject the sampling params this LangChain version always sends (temperature, top_p,
 * penalties, n, max_tokens) and expect max_completion_tokens + reasoning_effort, so for
 * them those params are cleared through modelKwargs (undefined keys are not serialized).
 */
export const esModeloDeRazonamiento = (modelo) => /^(o\d|gpt-5|gpt-6)/i.test(String(modelo || ''));

export function crearModeloChat() {
  const modelName = process.env.CHATBOT_MODEL || 'gpt-4o-mini';
  // Product lists carry one link per puesto/product, which is token-heavy:
  // 600 cut answers like "...opciones de comida veg".
  const maxTokens = Number(process.env.CHATBOT_MAX_TOKENS || 1500);
  const base = { apiKey: process.env.CHATBOT_API_KEY, modelName };

  if (!esModeloDeRazonamiento(modelName)) {
    return new ChatOpenAI({ ...base, temperature: 0, maxTokens });
  }

  const reasoningEffort = process.env.CHATBOT_REASONING_EFFORT || 'low';
  return new ChatOpenAI({
    ...base,
    modelKwargs: {
      temperature: undefined,
      top_p: undefined,
      frequency_penalty: undefined,
      presence_penalty: undefined,
      n: undefined,
      max_tokens: undefined,
      reasoning_effort: reasoningEffort,
      // Reasoning tokens count against this limit too, so leave room for them.
      max_completion_tokens: reasoningEffort === 'none' ? maxTokens : maxTokens + 2000,
    },
  });
}

/**
 * Streams the model answer, calling onPiece(text) for every fragment.
 * Resolves with { text, truncated }; truncated is true when the model hit maxTokens.
 */
async function generarRespuesta(input, onPiece = () => {}, signal, historial = []) {
  const prompt = await construirPrompt(input, historial);
  const openAIModel = crearModeloChat();

  let text = '';
  let truncated = false;
  const stream = await openAIModel.stream(prompt, signal ? { signal } : undefined);
  for await (const chunk of stream) {
    if (chunk?.response_metadata?.finish_reason === 'length') truncated = true;
    const piece = typeof chunk?.content === 'string' ? chunk.content : '';
    if (piece) {
      text += piece;
      onPiece(piece);
    }
  }
  return { text, truncated };
}

async function getChatResponse(userMessage, historial) {
  const input = normalizeChatInput(userMessage);
  if (!input) return MENSAJE_VACIO;

  try {
    const { text, truncated } = await generarRespuesta(input, undefined, undefined, normalizarHistorial(historial));
    return truncated ? cerrarRespuestaCortada(text) : text;
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI:', error);
    throw error;
  }
}

/**
 * Same answer as getChatResponse but delivered piece by piece through onPiece,
 * so the chat can show it while it is being written.
 */
async function streamChatResponse(userMessage, onPiece, signal, historial) {
  const input = normalizeChatInput(userMessage);
  if (!input) {
    onPiece(MENSAJE_VACIO);
    return;
  }
  try {
    const { truncated } = await generarRespuesta(input, onPiece, signal, normalizarHistorial(historial));
    if (truncated) onPiece(cierreDeStreamCortado());
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI (stream):', error);
    throw error;
  }
}

export { getChatResponse, streamChatResponse };

