import * as chai from 'chai';
import { describe, it } from 'mocha';
import { enrichEvento } from '../util/chatbot.js';

const expect = chai.expect;

// enrichEvento is exported separately from getChatResponse precisely so it can be
// tested without touching the DB or calling OpenAI.
describe('enrichEvento (unit, no server/DB/LLM required)', () => {
  it('always adds the event detail link built from the id', () => {
    const out = enrichEvento({ id: 10, nombre: 'Cosquin Rock' });
    expect(out.link).to.match(/\/listado-puestos\/10$/);
  });

  it('drops a dead placeholder ticket link so the bot cannot offer it', () => {
    const out = enrichEvento({
      id: 10,
      nombre: 'Cosquin Rock',
      linkVentaEntradas: 'https://entradas.demo/qf',
    });
    expect(out).to.not.have.property('linkVentaEntradas');
  });

  it('keeps a real ticket link', () => {
    const out = enrichEvento({
      id: 10,
      nombre: 'Cosquin Rock',
      linkVentaEntradas: 'https://tickets.real.com.ar/qf',
    });
    expect(out.linkVentaEntradas).to.equal('https://tickets.real.com.ar/qf');
  });

  it('does not mutate the input row', () => {
    const row = { id: 10, linkVentaEntradas: 'https://entradas.demo/qf' };
    enrichEvento(row);
    expect(row.linkVentaEntradas).to.equal('https://entradas.demo/qf');
    expect(row).to.not.have.property('link');
  });

  it('passes through non-objects untouched', () => {
    expect(enrichEvento(null)).to.equal(null);
    expect(enrichEvento(undefined)).to.equal(undefined);
  });
});
