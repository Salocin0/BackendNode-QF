import * as chai from 'chai';
import { describe, it, before, afterEach } from 'mocha';

const expect = chai.expect;

// What would actually be sent to OpenAI (undefined keys are dropped by JSON).
const enviados = (model) => JSON.parse(JSON.stringify(model.invocationParams()));

describe('chatbot model config (unit, no OpenAI call)', () => {
  let crearModeloChat;
  let esModeloDeRazonamiento;
  const envOriginal = { ...process.env };

  before(async () => {
    process.env.CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || 'sk-test-dummy';
    ({ crearModeloChat, esModeloDeRazonamiento } = await import('../util/chatbot.js'));
  });

  afterEach(() => {
    for (const k of ['CHATBOT_MODEL', 'CHATBOT_MAX_TOKENS', 'CHATBOT_REASONING_EFFORT']) {
      if (envOriginal[k] === undefined) delete process.env[k];
      else process.env[k] = envOriginal[k];
    }
  });

  it('detects reasoning models', () => {
    for (const m of ['gpt-6-luna', 'gpt-6.1-terra', 'gpt-5-mini', 'o4-mini']) expect(esModeloDeRazonamiento(m), m).to.equal(true);
    for (const m of ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1', undefined]) expect(esModeloDeRazonamiento(m), String(m)).to.equal(false);
  });

  it('classic models keep temperature 0 and max_tokens', () => {
    process.env.CHATBOT_MODEL = 'gpt-4.1-mini';
    const p = enviados(crearModeloChat());
    expect(p.model).to.equal('gpt-4.1-mini');
    expect(p.temperature).to.equal(0);
    expect(p.max_tokens).to.equal(1500);
    expect(p).to.not.have.property('reasoning_effort');
  });

  it('reasoning models get reasoning_effort and max_completion_tokens, without sampling params', () => {
    process.env.CHATBOT_MODEL = 'gpt-6-luna';
    const p = enviados(crearModeloChat());
    expect(p.model).to.equal('gpt-6-luna');
    expect(p.reasoning_effort).to.equal('low');
    expect(p.max_completion_tokens).to.equal(3500);
    for (const k of ['temperature', 'top_p', 'frequency_penalty', 'presence_penalty', 'n', 'max_tokens']) {
      expect(p, k).to.not.have.property(k);
    }
  });

  it('reasoning effort is configurable', () => {
    process.env.CHATBOT_MODEL = 'gpt-6-luna';
    process.env.CHATBOT_REASONING_EFFORT = 'none';
    const p = enviados(crearModeloChat());
    expect(p.reasoning_effort).to.equal('none');
    expect(p.max_completion_tokens).to.equal(1500);
  });

  it('report config: Luna thinks more (medium) with a larger reasoning budget; gpt-4o fallback stays classic', async () => {
    const { crearModeloOpenAI } = await import('../util/openaiModelo.js');
    const luna = enviados(crearModeloOpenAI({ modelName: 'gpt-6-luna', maxTokens: 1400, temperature: 0.2, reasoningEffort: 'medium', reasoningBudget: 6000 }));
    expect(luna.reasoning_effort).to.equal('medium');
    expect(luna.max_completion_tokens).to.equal(7400);
    expect(luna).to.not.have.property('temperature');
    const respaldo = enviados(crearModeloOpenAI({ modelName: 'gpt-4o', maxTokens: 1400, temperature: 0.2, reasoningEffort: 'medium' }));
    expect(respaldo.temperature).to.equal(0.2);
    expect(respaldo.max_tokens).to.equal(1400);
    expect(respaldo).to.not.have.property('reasoning_effort');
  });
});
