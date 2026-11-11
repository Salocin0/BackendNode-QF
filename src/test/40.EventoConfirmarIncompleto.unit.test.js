import * as chai from 'chai';
import { describe, it } from 'mocha';
import { estadosEvento } from '../estados/estados/estadosEvento.js';

const expect = chai.expect;
const evento = (estado) => ({ id: 19, estado, saves: 0, save: async function save() { this.saves += 1; } });

// Drafts EnPreparacion1/EnPreparacion2 still miss steps of the creation wizard: they cannot be confirmed.
describe('Confirmar evento only when its data is complete (no DB)', () => {
  for (const estado of ['EnPreparacion1', 'EnPreparacion2']) {
    it(`rejects confirming a draft in ${estado} and leaves it unchanged`, async () => {
      const e = evento(estado);
      let error = null;
      try { await estadosEvento[estado].confirmarEvento(e); } catch (err) { error = err; }
      expect(error, 'confirmarEvento should throw').to.be.instanceOf(Error);
      expect(error.status).to.equal(400);
      expect(error.message).to.match(/complet/i);
      expect(e.estado).to.equal(estado);
      expect(e.saves).to.equal(0);
    });
  }

  it('still confirms a complete event in EnPreparacion', async () => {
    const e = evento('EnPreparacion');
    await estadosEvento.EnPreparacion.confirmarEvento(e);
    expect(e.estado).to.equal('Confirmado');
    expect(e.saves).to.equal(1);
  });
});
