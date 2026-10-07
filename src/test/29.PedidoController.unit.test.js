import * as chai from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { createPedidoHandler } from '../controllers/pedidoCreate.handler.js';

const expect = chai.expect;

const makeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

describe('POST /pedido controller (stubbed services, no DB required)', () => {
  let created;
  let notified;
  let controller;
  let evento;

  beforeEach(() => {
    created = null;
    notified = null;
    evento = { id: 1, estado: 'EnCurso', fechaHoraFin: '2999-01-01T00:00:00Z' };
    controller = createPedidoHandler({
      eventoService: { getOne: async (id) => (id === 1 ? evento : null) },
      productoService: {
        getOne: async (id) =>
          ({
            1: { id: 1, precio: 100, puestoId: 5 },
            2: { id: 2, precio: 50, puestoId: 5 },
            3: { id: 3, precio: 10, puestoId: 99 },
          })[id] || null,
      },
      pedidoService: {
        create: async (pedido, detalles) => {
          created = { pedido, detalles };
          return { id: 77 };
        },
        sendNotificacionesPedidoCreado: async (puestoId, consumidorId) => {
          notified = { puestoId, consumidorId };
        },
      },
    });
  });

  const call = async (body, headers = { consumidorid: '4' }) => {
    const res = makeRes();
    await controller({ body, headers }, res);
    return res;
  };
  const validBody = () => ({
    puestoId: 5,
    eventoId: 1,
    detalles: [
      { productoId: 1, cantidad: 2 },
      { productoId: 2, cantidad: 1 },
    ],
  });

  it('happy path: 200, total recomputed server-side (subtotal 250 + 15%), prices from the DB', async () => {
    const res = await call({
      ...validBody(),
      total: 1,
      detalles: [
        { productoId: 1, cantidad: 2, precio: 0.01 },
        { productoId: 2, cantidad: 1 },
      ],
    });
    expect(res.statusCode).to.equal(200);
    expect(created.pedido.total).to.equal(287.5);
    expect(created.pedido.estado).to.equal('Pendiente');
    expect(created.detalles[0].precio).to.equal(100);
    expect(notified).to.deep.equal({ puestoId: 5, consumidorId: 4 });
  });

  it('takes consumidorId from the header, ignoring a different one in the body', async () => {
    await call({ ...validBody(), consumidorId: 999 });
    expect(created.pedido.consumidorId).to.equal(4);
  });

  it('falls back to the body consumidorId only when there is no header', async () => {
    await call({ ...validBody(), consumidorId: 8 }, {});
    expect(created.pedido.consumidorId).to.equal(8);
  });

  it('accepts an ISO precompra and marks the order Precomprado', async () => {
    const res = await call({ ...validBody(), precompra: '2999-05-01T13:00:00.000Z' });
    expect(res.statusCode).to.equal(200);
    expect(created.pedido.estado).to.equal('Precomprado');
    expect(created.pedido.fechaPreCompra.toISOString()).to.equal('2999-05-01T13:00:00.000Z');
  });

  it('400 for a non-ISO precompra', async () => {
    const res = await call({ ...validBody(), precompra: '01/05/2999' });
    expect(res.statusCode).to.equal(400);
    expect(created).to.equal(null);
  });

  it('404 when the event does not exist', async () => {
    const res = await call({ ...validBody(), eventoId: 2 });
    expect(res.statusCode).to.equal(404);
  });

  it('400 when the event already finished (state or dates)', async () => {
    evento.estado = 'Finalizado';
    expect((await call(validBody())).statusCode).to.equal(400);
    evento.estado = 'EnCurso';
    evento.fechaHoraFin = '2020-01-01T00:00:00Z';
    expect((await call(validBody())).statusCode).to.equal(400);
    expect(created).to.equal(null);
  });

  it('400 when eventoId is missing or invalid, so the finished-event check cannot be skipped', async () => {
    for (const eventoId of [undefined, 'undefined', 0, -1]) {
      const res = await call({ ...validBody(), eventoId });
      expect(res.statusCode, String(eventoId)).to.equal(400);
    }
  });

  it('400 for missing consumer, bad puestoId, empty or invalid detalles', async () => {
    expect((await call(validBody(), {})).statusCode).to.equal(400);
    expect((await call({ ...validBody(), puestoId: 'x' })).statusCode).to.equal(400);
    expect((await call({ ...validBody(), detalles: [] })).statusCode).to.equal(400);
    expect((await call({ ...validBody(), detalles: [{ productoId: 1, cantidad: 0 }] })).statusCode).to.equal(400);
    expect((await call({ ...validBody(), detalles: [{ productoId: 1, cantidad: 1.5 }] })).statusCode).to.equal(400);
    expect((await call({ ...validBody(), detalles: [{ cantidad: 1 }] })).statusCode).to.equal(400);
  });

  it('404 for an unknown product and 400 for a product of another stand', async () => {
    expect((await call({ ...validBody(), detalles: [{ productoId: 42, cantidad: 1 }] })).statusCode).to.equal(404);
    expect((await call({ ...validBody(), detalles: [{ productoId: 3, cantidad: 1 }] })).statusCode).to.equal(400);
    expect(created).to.equal(null);
  });
});
