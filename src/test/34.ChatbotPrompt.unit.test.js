import * as chai from 'chai';
import { describe, it } from 'mocha';
import { PromptTemplate } from '@langchain/core/prompts';
import { CHATBOT_PROMPT_TEMPLATE } from '../util/chatbotPrompt.js';

const expect = chai.expect;

// Renders the prompt locally: no DB, no OpenAI call, so it costs nothing to run.
describe('chatbotPrompt (unit, no server/DB/LLM required)', () => {
  const render = async (vars) =>
    new PromptTemplate({
      inputVariables: ['chatbotData', 'ayuda', 'input'],
      template: CHATBOT_PROMPT_TEMPLATE,
    }).format(vars);

  const evento = {
    id: 10,
    nombre: 'Cosquin Rock',
    link: 'https://qf.app/listado-puestos/10',
    carta: [{ puesto: 'Parrilla', productos: [{ nombre: 'Bondiola', precio: 4500 }] }],
  };

  it('injects the event data, including the menu with prices', async () => {
    const out = await render({
      chatbotData: JSON.stringify([evento]),
      ayuda: '[]',
      input: 'que puedo comer?',
    });
    expect(out).to.contain('Bondiola');
    expect(out).to.contain('4500');
    expect(out).to.contain('https://qf.app/listado-puestos/10');
  });

  it('injects the user question', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'hay lugar?' });
    expect(out).to.contain('hay lugar?');
  });

  it('allows only the supported markdown subset', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/SOLO este Markdown/i);
    expect(out).to.match(/\*\*negrita\*\*/);
    expect(out).to.match(/Nada de tablas, código, imágenes ni encabezados/i);
  });

  it('forbids inventing ticket links when the event has none', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/NO inventes un link de venta/i);
  });

  it('asks for complete sentences so answers are not cut mid-phrase', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/nunca dejes una frase cortada/i);
  });
});
