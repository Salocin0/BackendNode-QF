import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import { userService } from '../services/users.service.js';
import { Usuario } from '../DAO/models/users.model.js';
import { consumidorService } from '../services/consumidor.service.js';
import { repartidorService } from '../services/repartidor.service.js';

// The web keeps the session after acquiring a role (no logout), so the new role
// must already be persisted when POST /user/update/:id/to/:rol answers.
describe('updateRol espera a que se guarde el nuevo rol (models stubbed, no DB)', () => {
  const originals = {
    findOne: Usuario.findOne,
    getConsumidor: consumidorService.getOne,
    createRepartidor: repartidorService.create,
  };
  afterEach(() => {
    Usuario.findOne = originals.findOne;
    consumidorService.getOne = originals.getConsumidor;
    repartidorService.create = originals.createRepartidor;
  });

  const guardadoLento = (registro) => async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    registro.guardado = true;
  };

  it('no responde antes de guardar el usuario y el consumidor', async () => {
    const user = { id: 7, consumidorId: 3, tipoUsuario: 'consumidor' };
    const consumidor = { id: 3 };
    user.save = guardadoLento(user);
    consumidor.save = guardadoLento(consumidor);
    Usuario.findOne = async () => user;
    consumidorService.getOne = async () => consumidor;
    repartidorService.create = async () => ({ id: 11 });

    const resultado = await userService.updateRol(7, 'repartidor', {});

    expect(resultado.tipoUsuario).to.equal('repartidor');
    expect(consumidor.repartidorId).to.equal(11);
    expect(consumidor.guardado).to.equal(true);
    expect(user.guardado).to.equal(true);
  });
});
