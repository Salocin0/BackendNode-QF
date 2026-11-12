import * as chai from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { Evento } from '../DAO/models/evento.model.js';
import { estadosEvento } from '../estados/estados/estadosEvento.js';

const expect = chai.expect;

// Saving the days (step 3 of the web wizard, PUT /evento/preparacion/:id with diasEvento) runs
// EnPreparacion2.actualizarEvento: editing a paused event through the wizard leaves it "EnPreparacion".
describe('Editing a paused event through the wizard ends in EnPreparacion (no DB)', () => {
  const originalFindByPk = Evento.findByPk;
  let stored;

  beforeEach(() => {
    stored = { id: 19, estado: 'Pausado', saves: 0, save: async function save() { this.saves += 1; } };
    Evento.findByPk = async (id) => (Number(id) === 19 ? stored : null);
  });

  afterEach(() => {
    Evento.findByPk = originalFindByPk;
  });

  it('moves a Pausado event to EnPreparacion and saves it once', async () => {
    const result = await estadosEvento.EnPreparacion2.actualizarEvento(19);
    expect(result.estado).to.equal('EnPreparacion');
    expect(stored.estado).to.equal('EnPreparacion');
    expect(stored.saves).to.equal(1);
  });

  it('keeps finishing a draft (EnPreparacion2 -> EnPreparacion) as before', async () => {
    stored.estado = 'EnPreparacion2';
    await estadosEvento.EnPreparacion2.actualizarEvento(19);
    expect(stored.estado).to.equal('EnPreparacion');
    expect(stored.saves).to.equal(1);
  });
});
