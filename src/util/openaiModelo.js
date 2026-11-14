import { ChatOpenAI } from '@langchain/openai';

// Shared OpenAI model factory for the chatbot and the AI stats report.
// Reasoning models (o-series, gpt-5*, gpt-6*) reject the sampling params this LangChain
// version always sends (temperature, top_p, penalties, n, max_tokens) and expect
// max_completion_tokens + reasoning_effort, so for them those params are cleared through
// modelKwargs (undefined keys are not serialized).
export const esModeloDeRazonamiento = (modelo) => /^(o\d|gpt-5|gpt-6)/i.test(String(modelo || ''));

/**
 * @param {object} opts
 * @param {string} opts.modelName
 * @param {number} opts.maxTokens        visible answer budget
 * @param {number} [opts.temperature]    classic models only
 * @param {string} [opts.reasoningEffort] reasoning models only (none|low|medium|high|xhigh|max)
 * @param {number} [opts.reasoningBudget] extra tokens reserved for reasoning
 */
export function crearModeloOpenAI({ modelName, maxTokens, temperature = 0, reasoningEffort = 'low', reasoningBudget = 2000 }) {
  const base = { apiKey: process.env.CHATBOT_API_KEY, modelName };

  if (!esModeloDeRazonamiento(modelName)) {
    return new ChatOpenAI({ ...base, temperature, maxTokens });
  }

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
      max_completion_tokens: reasoningEffort === 'none' ? maxTokens : maxTokens + reasoningBudget,
    },
  });
}
