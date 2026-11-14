import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';

const expect = chai.expect;

// End-to-end through util/chatbot.js with the DB and OpenAI stubbed: catches wiring
// errors (missing imports, template variables) that the pure unit tests cannot see.
// A missing import here once made every chatbot request answer 500.
describe('chatbot pipeline (unit, DB and OpenAI stubbed)', () => {
  let sequelize;
  let ChatOpenAI;
  let originalQuery;
  let originalStream;
  let promptVisto;
  let getChatResponse;
  let streamChatResponse;

  before(async () => {
    // Dummy key: ChatOpenAI's constructor requires one, but stream() is stubbed below.
    process.env.CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || 'sk-test-dummy';
    ({ sequelize } = await import('../util/connections.js'));
    ({ ChatOpenAI } = await import('@langchain/openai'));
    originalQuery = sequelize.query;
    originalStream = ChatOpenAI.prototype.stream;
    sequelize.query = async (sql) =>
      sql.includes('chatbot_ayuda')
        ? [[{ tema: 'pedidos', pregunta: '¿Cómo pido?', respuesta: 'Elegí un evento.' }]]
        : [[{ id: 1, nombre: 'Fest', carta: [{ puestoId: 3, puesto: 'Verde Vivo', productos: [{ id: 7, nombre: 'Empanada de verdura', precio: 1600 }] }] }]];
    ChatOpenAI.prototype.stream = async function stream(prompt) {
      promptVisto = String(prompt);
      return (async function* gen() {
        yield { content: 'Sí, en ', response_metadata: {} };
        yield { content: 'Verde Vivo.', response_metadata: { finish_reason: 'stop' } };
      })();
    };
    ({ getChatResponse, streamChatResponse } = await import('../util/chatbot.js'));
  });

  after(() => {
    sequelize.query = originalQuery;
    ChatOpenAI.prototype.stream = originalStream;
  });

  it('answers with the event data and the recent conversation in the prompt', async () => {
    const historial = JSON.stringify([{ rol: 'usuario', texto: '¿hay algo vegano?' }, { rol: 'foody', texto: 'Sí, en [Verde Vivo](https://qf.app/x).' }]);
    const out = await getChatResponse('¿y empanadas?', historial);
    expect(out).to.equal('Sí, en Verde Vivo.');
    expect(promptVisto).to.contain('Empanada de verdura');
    expect(promptVisto).to.contain('/productos-puesto/3?evento=1&producto=7');
    expect(promptVisto).to.contain('Usuario: ¿hay algo vegano?');
    expect(promptVisto).to.contain('Foody: Sí, en Verde Vivo.');
  });

  it('works without history and streams the pieces', async () => {
    let texto = '';
    await streamChatResponse('¿hay empanadas?', (p) => { texto += p; });
    expect(texto).to.equal('Sí, en Verde Vivo.');
    expect(promptVisto).to.contain('(sin mensajes previos)');
  });
});
