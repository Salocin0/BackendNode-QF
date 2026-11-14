import * as chai from 'chai';
import { describe, it } from 'mocha';
import { PromptTemplate } from '@langchain/core/prompts';
import { CHATBOT_PROMPT_TEMPLATE } from '../util/chatbotPrompt.js';

const expect = chai.expect;

// Renders the prompt locally: no DB, no OpenAI call, so it costs nothing to run.
describe('chatbotPrompt (unit, no server/DB/LLM required)', () => {
  const render = async (vars) =>
    new PromptTemplate({
      inputVariables: ['chatbotData', 'ayuda', 'input', 'historial'],
      template: CHATBOT_PROMPT_TEMPLATE,
    }).format({ historial: '(sin mensajes previos)', ...vars });

  const evento = {
    id: 10,
    nombre: 'Cosquin Rock',
    link: 'https://qf.app/listado-puestos/10',
    carta: [{ puesto: 'Parrilla', productos: [{ nombre: 'Vacío al pan', descripcion: 'Vacío a la parrilla con provoleta y rúcula.', precio: 7200 }] }],
  };

  it('injects the event data, including the menu with prices', async () => {
    const out = await render({
      chatbotData: JSON.stringify([evento]),
      ayuda: '[]',
      input: 'que puedo comer?',
    });
    expect(out).to.contain('Vacío al pan');
    expect(out).to.contain('Vacío a la parrilla');
    expect(out).to.contain('7200');
    expect(out).to.contain('https://qf.app/listado-puestos/10');
  });

  it('injects the user question', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'hay lugar?' });
    expect(out).to.contain('hay lugar?');
  });

  it('injects the recent conversation and says the event data wins over it', async () => {
    const out = await render({
      chatbotData: '[]',
      ayuda: '[]',
      input: '¿y cuánto sale?',
      historial: 'Usuario: ¿hay algo vegano?\nFoody: Sí, la Burger de lentejas en Verde Vivo.',
    });
    expect(out).to.contain('Usuario: ¿hay algo vegano?');
    expect(out).to.contain('Foody: Sí, la Burger de lentejas');
    expect(out).to.match(/Los datos de los eventos de arriba SIEMPRE mandan/i);
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

  // Without these instructions the model answered "no tengo la carta" even
  // though the menu was in the payload.
  it('tells the model to search the menu for a product', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/buscá coincidencias en el nombre Y la descripción del producto/i);
    expect(out).to.match(/nombrando el evento y el puesto/i);
  });

  it('forbids inventing products or prices', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/No inventes productos ni precios/i);
  });

  it('forbids vague filler at the end and asks for exact counts of omitted products', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/No agregues resúmenes ni frases de relleno/i);
    expect(out).to.match(/cantidad exacta que falta/i);
    expect(out).to.not.match(/una oración de cierre/i);
  });

  it('explains an empty menu instead of claiming the data is missing', async () => {
    const out = await render({ chatbotData: '[]', ayuda: '[]', input: 'x' });
    expect(out).to.match(/todavía no publicó sus puestos/i);
  });
});
