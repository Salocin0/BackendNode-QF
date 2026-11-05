import * as chai from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { responder, AsignacionError } from '../services/asignacion.core.js';

const expect = chai.expect;

describe('Asignación: aceptar / rechazar', () => {
  let row;
  let saved;
  let deps;

  beforeEach(() => {
    saved = 0;
    row = { id: 7, estado: 'Pendiente', repartidoreId: 3, save: async () => { saved += 1; } };
    deps = {
      Asignacion: { findByPk: async (id) => (id === 7 ? row : null) },
      getConsumidor: async (id) => ({ 10: { repartidorId: 3 }, 11: { repartidorId: 4 }, 12: { repartidorId: null } })[id] || null,
    };
  });

  const fails = async (promise, status) => {
    try {
      await promise;
    } catch (e) {
      expect(e).to.be.instanceOf(AsignacionError);
      expect(e.status).to.equal(status);
      return;
    }
    throw new Error('expected AsignacionError');
  };

  it('acepta una oferta pendiente del repartidor y la persiste', async () => {
    const result = await responder(deps, 7, 'Aceptado', 10);
    expect(result.estado).to.equal('Aceptado');
    expect(saved).to.equal(1);
  });

  it('rechaza una oferta pendiente', async () => {
    expect((await responder(deps, '7', 'Rechazado', 10)).estado).to.equal('Rechazado');
  });

  it('sin consumidorId (rutas GET legacy de la app móvil) no exige dueño', async () => {
    expect((await responder(deps, 7, 'Aceptado')).estado).to.equal('Aceptado');
  });

  it('devuelve 404 si la asignación no existe y 400 si el id es inválido', async () => {
    await fails(responder(deps, 99, 'Aceptado', 10), 404);
    await fails(responder(deps, 'abc', 'Aceptado', 10), 400);
    await fails(responder(deps, undefined, 'Aceptado', 10), 400);
  });

  it('devuelve 403 si la oferta es de otro repartidor o el consumidor no es repartidor', async () => {
    await fails(responder(deps, 7, 'Aceptado', 11), 403);
    await fails(responder(deps, 7, 'Aceptado', 12), 403);
    await fails(responder(deps, 7, 'Aceptado', 999), 403);
    expect(row.estado).to.equal('Pendiente');
    expect(saved).to.equal(0);
  });

  it('devuelve 409 si la oferta ya no está pendiente (caducada, aceptada o rechazada)', async () => {
    for (const estado of ['Caducado', 'Aceptado', 'Rechazado']) {
      row.estado = estado;
      await fails(responder(deps, 7, 'Aceptado', 10), 409);
    }
    expect(saved).to.equal(0);
  });
});
