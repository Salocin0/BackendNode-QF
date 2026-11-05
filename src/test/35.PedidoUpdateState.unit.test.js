import * as chai from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { createUpdateStateHandler, ACCION_POR_ETIQUETA } from '../controllers/pedidoUpdateState.handler.js';
import { estadosPedido } from '../estados/estados/estadosPedido.js';

const expect = chai.expect;

const makeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

describe('POST /pedido/cambiarEstado/:id/:accion (stubbed services, no DB)', () => {
  let pedido;
  let calls;
  let notifyFails;
  let handler;

  beforeEach(() => {
    calls = [];
    notifyFails = false;
    pedido = { id: 152, estado: 'Pendiente', consumidorId: 4, puestoId: 1, saves: 0, save: async () => { pedido.saves += 1; } };
    const notify = (name) => async (...args) => {
      if (notifyFails) throw new Error('push provider down');
      calls.push([name, ...args]);
    };
    handler = createUpdateStateHandler({
      estadosPedido,
      pedidoService: {
        getOne: async (id) => (String(id) === '152' ? pedido : null),
        sendNotificacionesPedidoAceptado: notify('aceptado'),
        sendNotificacionesPedidoPreparado: notify('preparado'),
        sendNotificacionesPedidoEnCamino: notify('enCamino'),
        sendNotificacionesPedidoCancelado: notify('cancelado'),
        sendNotificacionesPedidoEntregado: notify('entregado'),
        sendNotificacionesPedidoValorado: notify('valorado'),
      },
    });
  });

  const run = async (accion, id = '152') => {
    const res = makeRes();
    await handler({ params: { id, accion } }, res);
    return res;
  };

  it('walks the whole happy path used on the Kanban and by the courier, with one notification per step', async () => {
    for (const [accion, estado] of [['aceptar', 'Aceptado'], ['preparar', 'EnPreparacion'], ['enCamino', 'EnCamino'], ['pedidoEntregado', 'Entregado'], ['valorar', 'Valorado']]) {
      const res = await run(accion);
      expect(res.statusCode, accion).to.equal(200);
      expect(res.body.data.estado).to.equal(estado);
    }
    expect(calls.map(([name]) => name)).to.deep.equal(['aceptado', 'preparado', 'enCamino', 'entregado', 'valorado']);
  });

  it('accepts the Kanban labels (Aceptado, En Preparación, En Camino, Cancelado)', async () => {
    expect((await run('Aceptado')).statusCode).to.equal(200);
    expect((await run('En Preparación')).statusCode).to.equal(200);
    expect((await run('En Camino')).statusCode).to.equal(200);
    expect(pedido.estado).to.equal('EnCamino');
    expect(ACCION_POR_ETIQUETA.Cancelado).to.equal('cancelar');
  });

  it('cancelling a pending order notifies the stand and the consumer', async () => {
    const res = await run('Cancelado');
    expect(res.statusCode).to.equal(200);
    expect(pedido.estado).to.equal('Cancelado');
    expect(calls).to.deep.equal([['cancelado', 1, 4]]);
  });

  it('delivering stores the delivery date', async () => {
    pedido.estado = 'EnCamino';
    await run('pedidoEntregado');
    expect(pedido.fechaEntrega).to.be.instanceOf(Date);
    expect(pedido.saves).to.equal(2);
  });

  it('returns 404 for an order that does not exist', async () => {
    const res = await run('aceptar', '999');
    expect(res.statusCode).to.equal(404);
  });

  it('returns 400 for an unknown action', async () => {
    for (const accion of ['volar', 'Entregado', '']) {
      const res = await run(accion || 'x');
      expect(res.statusCode, accion).to.equal(400);
    }
    expect(pedido.estado).to.equal('Pendiente');
  });

  it('returns 409 and keeps the state for a forbidden transition', async () => {
    const res = await run('preparar');
    expect(res.statusCode).to.equal(409);
    expect(pedido.estado).to.equal('Pendiente');
    expect(pedido.saves).to.equal(0);
    expect(calls).to.deep.equal([]);
  });

  it('a delivered order cannot be cancelled nor delivered twice', async () => {
    pedido.estado = 'Entregado';
    expect((await run('cancelar')).statusCode).to.equal(409);
    expect((await run('pedidoEntregado')).statusCode).to.equal(409);
    expect(pedido.estado).to.equal('Entregado');
  });

  it('a notification failure does not turn a successful change into an error', async () => {
    notifyFails = true;
    const res = await run('aceptar');
    expect(res.statusCode).to.equal(200);
    expect(pedido.estado).to.equal('Aceptado');
  });

  it('returns 500 only for unexpected failures (e.g. database down)', async () => {
    handler = createUpdateStateHandler({ estadosPedido, pedidoService: { getOne: async () => { throw new Error('db down'); } } });
    const res = await run('aceptar');
    expect(res.statusCode).to.equal(500);
  });
});
