import * as chai from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { buildCheckoutSnapshot, createCartCheckoutService, CheckoutError } from '../services/cartCheckout.core.js';

const expect = chai.expect;
const FUTURE = '2999-01-01T00:00:00Z';
const product = (overrides = {}) => ({ id: 10, puestoId: 1, precio: 1000, estado: true, ...overrides });
const item = (overrides = {}) => ({
  id: 1,
  cantidad: 1,
  fecha: null,
  producto: product(),
  evento: { id: 5, estado: 'EnCurso', fechaHoraFin: FUTURE },
  ...overrides,
});
const rejects = (fn, status = 400, message) => {
  try {
    fn();
  } catch (e) {
    expect(e).to.be.instanceOf(CheckoutError);
    expect(e.status).to.equal(status);
    if (message) expect(e.message).to.match(message);
    return;
  }
  throw new Error('expected CheckoutError');
};

describe('buildCheckoutSnapshot', () => {
  it('prices a single item with the 15% service fee, in cents', () => {
    const { orders, amount } = buildCheckoutSnapshot([item({ cantidad: 3, producto: product({ precio: 3500 }) })]);
    expect(orders).to.have.length(1);
    expect(orders[0]).to.include({ puestoId: 1, eventoId: 5, subtotalCents: 1050000, totalCents: 1207500, currency: 'usd' });
    expect(amount).to.equal(1207500);
  });

  it('matches the cart screen: $13.000 of products -> $14.950', () => {
    const { amount } = buildCheckoutSnapshot([
      item({ id: 1, cantidad: 3, producto: product({ id: 10, precio: 3500 }) }),
      item({ id: 2, cantidad: 1, producto: product({ id: 11, precio: 2500 }) }),
    ]);
    expect(amount).to.equal(1495000);
  });

  it('creates one order per stand, per event and per pre-purchase date', () => {
    const { orders, amount } = buildCheckoutSnapshot([
      item({ id: 1 }),
      item({ id: 2, producto: product({ id: 11, puestoId: 2, precio: 500 }) }),
      item({ id: 3, evento: { id: 6, estado: 'EnCurso', fechaHoraFin: FUTURE } }),
      item({ id: 4, fecha: '2999-02-01T10:00:00Z' }),
      item({ id: 5, fecha: '2999-02-02T10:00:00Z' }),
      item({ id: 6, fecha: '2999-02-02T10:00:00Z', cantidad: 2 }),
    ]);
    expect(orders).to.have.length(5);
    const merged = orders.find((order) => order.fechaPreCompra === '2999-02-02T10:00:00.000Z');
    expect(merged.detalles).to.have.length(2);
    expect(merged.items.map((i) => i.id)).to.deep.equal([5, 6]);
    expect(amount).to.equal(orders.reduce((sum, order) => sum + order.totalCents, 0));
  });

  it('rounds the fee to the nearest cent', () => {
    const { orders } = buildCheckoutSnapshot([item({ producto: product({ precio: 3.33 }) })]);
    expect(orders[0].subtotalCents).to.equal(333);
    expect(orders[0].totalCents).to.equal(383);
  });

  it('accepts numeric strings for price and quantity (DECIMAL columns)', () => {
    const { amount } = buildCheckoutSnapshot([item({ cantidad: '2', producto: product({ precio: '1000.00' }) })]);
    expect(amount).to.equal(230000);
  });

  it('rejects an empty cart', () => rejects(() => buildCheckoutSnapshot([]), 400, /vacío/));

  it('rejects invalid quantities', () => {
    for (const cantidad of [0, -1, 'abc', 1.5, null, undefined]) {
      rejects(() => buildCheckoutSnapshot([item({ cantidad })]), 400, /Cantidad o precio/);
    }
  });

  it('rejects invalid or negative prices', () => {
    for (const precio of [-1, 'x', NaN, undefined]) {
      rejects(() => buildCheckoutSnapshot([item({ producto: product({ precio }) })]), 400);
    }
  });

  it('rejects a cart whose total is zero (free items cannot go through Stripe)', () => {
    rejects(() => buildCheckoutSnapshot([item({ producto: product({ precio: 0 }) })]), 400, /importe/);
  });

  it('rejects totals above the Stripe limit used by the app', () => {
    rejects(() => buildCheckoutSnapshot([item({ producto: product({ precio: 1000000 }) })]), 400, /importe/);
  });

  it('rejects disabled products and finished or cancelled events', () => {
    rejects(() => buildCheckoutSnapshot([item({ producto: product({ estado: false }) })]), 400, /ya no están disponibles/);
    rejects(() => buildCheckoutSnapshot([item({ evento: { id: 5, estado: 'Finalizado' } })]), 400, /ya no están disponibles/);
    rejects(() => buildCheckoutSnapshot([item({ evento: { id: 5, estado: 'Cancelado' } })]), 400, /ya no están disponibles/);
    rejects(() => buildCheckoutSnapshot([item({ evento: { id: 5, estado: 'EnCurso', fechaHoraFin: '2000-01-01T00:00:00Z' } })]), 400, /ya no están disponibles/);
  });

  it('rejects items without product, stand or event', () => {
    rejects(() => buildCheckoutSnapshot([item({ producto: null })]), 400, /inválido/);
    rejects(() => buildCheckoutSnapshot([item({ producto: product({ puestoId: undefined }) })]), 400, /inválido/);
    rejects(() => buildCheckoutSnapshot([item({ evento: null })]), 400, /inválido/);
  });

  it('rejects ambiguous pre-purchase dates', () => {
    rejects(() => buildCheckoutSnapshot([item({ fecha: '05/11/2026' })]), 400, /Fecha de precompra/);
  });
});

describe('cart checkout service (stubbed models and Stripe)', () => {
  let state;
  let svc;

  const build = () => {
    const cart = { id: 9, consumidorId: 4 };
    const cartItems = () => [
      item({ id: 1, cantidad: 3, producto: product({ id: 10, precio: 3500 }) }),
      item({ id: 2, cantidad: 1, producto: product({ id: 11, precio: 2500 }) }),
    ];
    const stripe = {
      customers: { create: async () => ({ id: 'cus_1' }) },
      paymentIntents: {
        create: async (body, opts) => {
          state.intentCalls.push([body, opts]);
          state.intent = { id: 'pi_1', client_secret: 'secret', currency: body.currency, amount: body.amount, metadata: body.metadata };
          return state.intent;
        },
        retrieve: async () => ({
          ...state.intent,
          status: state.intentStatus,
          amount_received: state.intentStatus === 'succeeded' ? state.intent.amount : 0,
          ...state.intentOverride,
        }),
      },
    };
    const Checkout = {
      create: async (data) => {
        const id = `chk_${state.nextId++}`;
        const created = { id, status: 'pending', ...data, update: async (patch) => Object.assign(created, patch) };
        state.checkouts[id] = created;
        return created;
      },
      findByPk: async (id) => state.checkouts[id] || null,
    };
    return createCartCheckoutService({
      sequelize: { transaction: async (fn) => fn({ LOCK: { UPDATE: 'UPDATE' } }) },
      Checkout,
      Carrito: { findOne: async ({ where }) => (where.consumidorId === 4 ? cart : null) },
      ItemCarrito: {
        findAll: async () => cartItems().map((i) => ({ ...i, get: () => i })),
        findOne: async ({ where }) => {
          const found = state.items.find((i) => i.id === where.id && i.carritoId === where.carritoId);
          return found
            ? { cantidad: found.cantidad, update: async (p) => Object.assign(found, p), destroy: async () => { state.items = state.items.filter((i) => i !== found); } }
            : null;
        },
      },
      Producto: {},
      Evento: {},
      Pedido: { create: async (data) => { const order = { id: 100 + state.pedidos.length, ...data }; state.pedidos.push(order); return order; } },
      DetallePedido: { bulkCreate: async (rows) => { state.detalles.push(...rows); } },
      getStripe: () => stripe,
      notify: async (puestoId, consumidorId) => {
        if (state.notifyFails) throw new Error('push provider down');
        state.notified.push([puestoId, consumidorId]);
      },
    });
  };

  beforeEach(() => {
    state = {
      checkouts: {}, pedidos: [], detalles: [], notified: [], intentCalls: [],
      items: [{ id: 1, carritoId: 9, cantidad: 3 }, { id: 2, carritoId: 9, cantidad: 1 }],
      intentStatus: 'succeeded', intentOverride: {}, nextId: 1, notifyFails: false,
    };
    svc = build();
  });

  const fails = async (promise, status) => {
    try {
      await promise;
    } catch (e) {
      expect(e).to.be.instanceOf(CheckoutError);
      expect(e.status).to.equal(status);
      return e;
    }
    throw new Error('expected CheckoutError');
  };

  it('create: builds the checkout and a USD payment intent with idempotency keys', async () => {
    const result = await svc.create(4);
    expect(result).to.include({ clientSecret: 'secret', amount: 1495000, currency: 'usd' });
    const [body, opts] = state.intentCalls[0];
    expect(body).to.include({ amount: 1495000, currency: 'usd' });
    expect(body.metadata).to.include({ checkoutId: result.checkoutId, consumidorId: '4' });
    expect(opts.idempotencyKey).to.equal(`cart-checkout-${result.checkoutId}`);
    expect(state.checkouts[result.checkoutId].paymentIntentId).to.equal('pi_1');
  });

  it('create: a consumer without cart gets a clear error', async () => {
    const e = await fails(svc.create(99), 400);
    expect(e.message).to.match(/vacío/);
  });

  it('complete: creates one order per group, clears the cart, notifies and stores the result', async () => {
    const { checkoutId } = await svc.create(4);
    const result = await svc.complete(checkoutId, 4);
    expect(result).to.deep.equal({ orderIds: [100], amount: 1495000 });
    expect(state.pedidos[0]).to.include({ consumidorId: 4, puestoId: 1, eventoId: 5, estado: 'Pendiente', total: 14950 });
    expect(state.detalles).to.have.length(2);
    expect(state.items).to.have.length(0);
    expect(state.checkouts[checkoutId].status).to.equal('completed');
    expect(state.notified).to.deep.equal([[1, 4]]);
  });

  it('complete: pre-purchase groups are created as Precomprado', async () => {
    const { checkoutId } = await svc.create(4);
    state.checkouts[checkoutId].snapshot[0].fechaPreCompra = '2999-02-01T10:00:00.000Z';
    await svc.complete(checkoutId, 4);
    expect(state.pedidos[0].estado).to.equal('Precomprado');
  });

  it('complete: is idempotent, a second call returns the stored result without creating more orders', async () => {
    const { checkoutId } = await svc.create(4);
    const first = await svc.complete(checkoutId, 4);
    const second = await svc.complete(checkoutId, 4);
    expect(second).to.deep.equal(first);
    expect(state.pedidos).to.have.length(1);
    expect(state.notified).to.have.length(1);
  });

  it('complete: keeps the remaining quantity when the cart holds more units than were paid', async () => {
    const { checkoutId } = await svc.create(4);
    state.items[0].cantidad = 5;
    await svc.complete(checkoutId, 4);
    expect(state.items).to.deep.equal([{ id: 1, carritoId: 9, cantidad: 2 }]);
  });

  it('complete: refuses to create orders when payment is not confirmed', async () => {
    const { checkoutId } = await svc.create(4);
    state.intentStatus = 'requires_payment_method';
    await fails(svc.complete(checkoutId, 4), 409);
    expect(state.pedidos).to.have.length(0);
  });

  it('complete: refuses mismatching amount, currency or checkout metadata', async () => {
    const { checkoutId } = await svc.create(4);
    for (const override of [{ amount_received: 1 }, { currency: 'ars' }, { metadata: { checkoutId: 'other' } }]) {
      state.intentOverride = override;
      await fails(svc.complete(checkoutId, 4), 409);
    }
    expect(state.pedidos).to.have.length(0);
  });

  it("complete/resume: another consumer cannot touch someone else's checkout (404)", async () => {
    const { checkoutId } = await svc.create(4);
    await fails(svc.complete(checkoutId, 5), 404);
    await fails(svc.resume(checkoutId, 5), 404);
    await fails(svc.complete('chk_missing', 4), 404);
    expect(state.pedidos).to.have.length(0);
  });

  it('complete: a failing notification does not fail the purchase', async () => {
    const { checkoutId } = await svc.create(4);
    state.notifyFails = true;
    const result = await svc.complete(checkoutId, 4);
    expect(result.orderIds).to.have.length(1);
    expect(state.checkouts[checkoutId].status).to.equal('completed');
  });

  it('resume: reports paid and completed flags without creating a new intent', async () => {
    const { checkoutId } = await svc.create(4);
    const resumed = await svc.resume(checkoutId, 4);
    expect(resumed).to.include({ checkoutId, paid: true, completed: false, currency: 'usd' });
    expect(state.intentCalls).to.have.length(1);
  });
});
