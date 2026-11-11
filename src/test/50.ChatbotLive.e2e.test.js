import * as chai from 'chai';
import { describe, it, before } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect;

// Live end-to-end check of Foody against a deployed backend: it calls OpenAI and spends credits,
// so it only runs when CHATBOT_LIVE_URL is set (e.g. https://backendnode-qf-production.up.railway.app).
// The assertions rely on the demo seed catalog (seedDemoCatalog.js).
const BASE_URL = (process.env.CHATBOT_LIVE_URL || '').replace(/\/+$/, '');
const describeLive = BASE_URL ? describe : describe.skip;

describeLive(`Chatbot Foody en vivo (${BASE_URL || 'CHATBOT_LIVE_URL no definido'})`, function () {
  this.timeout(90_000);
  const requester = supertest(BASE_URL);

  const ask = async (userMessage) => {
    const res = await requester.post('/chatbot').send({ userMessage });
    expect(res.status, JSON.stringify(res.body)).to.equal(200);
    expect(res.body?.data?.user_message).to.be.a('string');
    expect(res.body.data.chat_response).to.be.a('string').that.is.not.empty;
    return res.body.data.chat_response;
  };

  before(async function () {
    // Wakes the service up so a cold start does not eat the first real case's timeout.
    await requester.get('/').timeout(60_000).catch(() => {});
  });

  it('rechaza un mensaje vacío sin llamar al modelo', async () => {
    const res = await requester.post('/chatbot').send({ userMessage: '   ' });
    expect(res.status).to.equal(400);
  });

  it('encuentra un producto por nombre con su puesto, precio y link al evento', async () => {
    const text = await ask('¿Dónde venden choripán y a qué precio?');
    expect(text).to.match(/chorip[aá]n/i);
    expect(text).to.match(/\$\s?\d/);
    expect(text).to.match(/\/listado-puestos\/\d+/);
  });

  it('encuentra un producto por un ingrediente que solo figura en la descripción', async () => {
    const text = await ask('¿Hay algo que venga con rúcula?');
    expect(text).to.match(/vac[ií]o al pan/i);
  });

  it('no inventa productos que no están en ninguna carta', async () => {
    const text = await ask('¿Dónde venden sushi de salmón?');
    expect(text).to.match(/no (lo |la )?(encontr|hay|tengo|figura|aparece|se vende|venden)/i);
    expect(text).not.to.match(/sushi[^.\n]*\$\s?\d/i);
  });

  it('responde dudas de uso de la plataforma', async () => {
    const text = await ask('¿Cómo hago un pedido?');
    expect(text).to.match(/pedido/i);
  });
});
