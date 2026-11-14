import * as chai from 'chai';
import { describe, it, before, afterEach } from 'mocha';
import { cerrarRespuestaCortada, cierreDeStreamCortado, NOTA_RESPUESTA_LARGA } from '../util/chatbotText.js';

const expect = chai.expect;

// The service module transitively loads the e-mail sender, which requires a key at import time.
let chatbotController;
let chatbotService;
before(async () => {
  process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_test_dummy';
  ({ chatbotController } = await import('../controllers/chatbot.controller.js'));
  ({ chatbotService } = await import('../services/chatbot.service.js'));
});

describe('chatbotText (unit, no server/DB/LLM required)', () => {
  it('drops the unfinished last line of a cut answer and adds a note', () => {
    const cortada = '- [Wrap de falafel](x): rico. **$5800**\n\nEstas son las opciones de comida veg';
    const out = cerrarRespuestaCortada(cortada);
    expect(out).to.not.contain('comida veg');
    expect(out).to.contain('**$5800**');
    expect(out.endsWith(NOTA_RESPUESTA_LARGA)).to.equal(true);
  });

  it('keeps complete sentences of a single-line cut answer', () => {
    const out = cerrarRespuestaCortada('Hay dos eventos. El primero es el Cuartet');
    expect(out).to.equal(`Hay dos eventos.\n\n${NOTA_RESPUESTA_LARGA}`);
  });

  it('falls back to the note alone when nothing is complete', () => {
    expect(cerrarRespuestaCortada('Hay dos even')).to.equal(NOTA_RESPUESTA_LARGA);
    expect(cerrarRespuestaCortada(undefined)).to.equal(NOTA_RESPUESTA_LARGA);
  });

  it('closes a cut stream with the note', () => {
    expect(cierreDeStreamCortado()).to.contain(NOTA_RESPUESTA_LARGA);
  });
});

const fakeRes = () => {
  const res = {
    statusCode: null, headers: {}, chunks: [], ended: false, jsonBody: null, writableEnded: false,
    status(code) { this.statusCode = code; return this; },
    set(h) { Object.assign(this.headers, h); return this; },
    flushHeaders() {},
    write(c) { this.chunks.push(c); },
    end(c) { if (c) this.chunks.push(c); this.ended = true; this.writableEnded = true; },
    json(body) { this.jsonBody = body; this.ended = true; return this; },
    on() {},
  };
  return res;
};

describe('POST /chatbot/stream controller (unit, service stubbed)', () => {
  let original;
  before(() => { original = chatbotService.streamChatbotTexto; });
  afterEach(() => { chatbotService.streamChatbotTexto = original; });

  it('writes every fragment as plain text, in order', async () => {
    chatbotService.streamChatbotTexto = async (msg, onPiece) => { onPiece('Hola '); onPiece('mundo'); };
    const res = fakeRes();
    await chatbotController.streamChatbotText({ body: { userMessage: 'hola' } }, res);
    expect(res.statusCode).to.equal(200);
    expect(res.headers['Content-Type']).to.match(/text\/plain/);
    expect(res.headers['Cache-Control']).to.contain('no-transform');
    expect(res.chunks.join('')).to.equal('Hola mundo');
    expect(res.ended).to.equal(true);
  });

  it('answers a JSON 500 when it fails before the first fragment', async () => {
    chatbotService.streamChatbotTexto = async () => { throw new Error('boom'); };
    const res = fakeRes();
    await chatbotController.streamChatbotText({ body: { userMessage: 'hola' } }, res);
    expect(res.statusCode).to.equal(500);
    expect(res.jsonBody.status).to.equal('error');
    expect(res.jsonBody.msg).to.match(/^No pude responder/);
  });

  it('rejects an empty message with 400', async () => {
    const res = fakeRes();
    await chatbotController.streamChatbotText({ body: { userMessage: '   ' } }, res);
    expect(res.statusCode).to.equal(400);
  });

  it('passes the recent conversation sent by the client to the service', async () => {
    let recibido;
    chatbotService.streamChatbotTexto = async (msg, onPiece, signal, historial) => { recibido = historial; onPiece('ok'); };
    const historial = JSON.stringify([{ rol: 'usuario', texto: '¿hay algo vegano?' }]);
    await chatbotController.streamChatbotText({ body: { userMessage: '¿y cuánto sale?', historial } }, fakeRes());
    expect(recibido).to.equal(historial);
  });
});
