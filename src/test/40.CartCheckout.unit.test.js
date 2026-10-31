import { expect } from 'chai';
import { Sequelize, DataTypes } from 'sequelize';
import { createCartCheckoutService, buildCheckoutSnapshot } from '../services/cartCheckout.core.js';

describe('single-payment cart checkout (isolated in-memory DB)', function () {
  this.timeout(10000);
  let db, Checkout, Carrito, ItemCarrito, Producto, Evento, Pedido, DetallePedido, service, intents, notifications;
  before(async () => {
    db = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    Producto = db.define('producto', { precio: DataTypes.FLOAT, puestoId: DataTypes.INTEGER, estado: DataTypes.BOOLEAN });
    Evento = db.define('evento', { estado: DataTypes.STRING, fechaHoraFin: DataTypes.DATE });
    Carrito = db.define('Carrito', { consumidorId: DataTypes.INTEGER });
    ItemCarrito = db.define('ItemCarrito', { cantidad: DataTypes.INTEGER, fecha: DataTypes.DATE, carritoId: DataTypes.INTEGER });
    ItemCarrito.belongsTo(Producto, { foreignKey: 'productoId' });
    ItemCarrito.belongsTo(Evento, { foreignKey: 'eventoId' });
    Pedido = db.define('Pedido', { consumidorId: DataTypes.INTEGER, puestoId: DataTypes.INTEGER, eventoId: DataTypes.INTEGER, fecha: DataTypes.DATE, fechaPreCompra: DataTypes.DATE, estado: DataTypes.STRING, total: DataTypes.FLOAT });
    DetallePedido = db.define('DetallePedido', { PedidoId: DataTypes.INTEGER, productoId: DataTypes.INTEGER, cantidad: DataTypes.INTEGER, precio: DataTypes.FLOAT });
    Checkout = db.define('Checkout', { id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, consumidorId: DataTypes.INTEGER, carritoId: DataTypes.INTEGER, snapshot: DataTypes.JSON, amount: DataTypes.INTEGER, paymentIntentId: DataTypes.STRING, status: { type: DataTypes.STRING, defaultValue: 'pending' }, result: DataTypes.JSON });
  });
  beforeEach(async () => {
    await db.sync({ force: true });
    const cart = await Carrito.create({ consumidorId: 1 });
    await Evento.create({ id: 1, estado: 'EnCurso', fechaHoraFin: '2099-01-01' });
    await Producto.bulkCreate([{ id: 1, precio: 1000, puestoId: 1, estado: true }, { id: 2, precio: 500, puestoId: 2, estado: true }]);
    await ItemCarrito.bulkCreate([{ id: 1, carritoId: cart.id, productoId: 1, eventoId: 1, cantidad: 2 }, { id: 2, carritoId: cart.id, productoId: 2, eventoId: 1, cantidad: 1 }]);
    intents = new Map(); notifications = [];
    const stripe = { paymentIntents: {
      create: async (data) => { const intent = { ...data, id: 'pi_test', client_secret: 'secret_test', status: 'requires_payment_method', amount_received: 0 }; intents.set(intent.id, intent); return intent; },
      retrieve: async (id) => intents.get(id),
    } };
    service = createCartCheckoutService({ sequelize: db, Checkout, Carrito, ItemCarrito, Producto, Evento, Pedido, DetallePedido, getStripe: () => stripe, notify: async (...args) => notifications.push(args) });
  });
  after(async () => db.close());
  const pay = () => { Object.assign(intents.get('pi_test'), { status: 'succeeded', amount_received: 287500 }); };

  it('quotes all stands from server prices, creates all orders once and clears only purchased items', async () => {
    const quote = await service.create(1);
    expect(quote.amount).to.equal(287500);
    await ItemCarrito.update({ cantidad: 3 }, { where: { id: 1 } });
    pay();
    const first = await service.complete(quote.checkoutId, 1);
    const second = await service.complete(quote.checkoutId, 1);
    expect(second).to.deep.equal(first);
    expect(await Pedido.count()).to.equal(2);
    expect(await DetallePedido.count()).to.equal(2);
    expect(notifications).to.have.length(2);
    expect((await ItemCarrito.findByPk(1)).cantidad).to.equal(1);
    expect(await ItemCarrito.findByPk(2)).to.equal(null);
    expect((await service.resume(quote.checkoutId, 1)).completed).to.equal(true);
  });
  it('refuses unpaid or mismatched payments without creating orders or clearing the cart', async () => {
    const quote = await service.create(1);
    for (const received of [0, 1]) {
      if (received) Object.assign(intents.get('pi_test'), { status: 'succeeded', amount_received: received });
      let error;
      try { await service.complete(quote.checkoutId, 1); } catch (caught) { error = caught; }
      expect(error.status).to.equal(409);
    }
    expect(await Pedido.count()).to.equal(0);
    expect(await ItemCarrito.count()).to.equal(2);
  });
  it('rolls back all orders and cart removals on a detail failure, then retries without duplicate orders', async () => {
    const quote = await service.create(1); pay();
    const original = DetallePedido.bulkCreate;
    let calls = 0;
    DetallePedido.bulkCreate = function (...args) { if (++calls === 2) throw new Error('detail failure'); return original.apply(this, args); };
    try { await service.complete(quote.checkoutId, 1); } catch (error) { expect(error.message).to.equal('detail failure'); }
    finally { DetallePedido.bulkCreate = original; }
    expect(await Pedido.count()).to.equal(0);
    expect(await ItemCarrito.count()).to.equal(2);
    await service.complete(quote.checkoutId, 1);
    expect(await Pedido.count()).to.equal(2);
  });
  it('does not allow another consumer to complete a payment', async () => {
    const quote = await service.create(1); pay();
    let error;
    try { await service.complete(quote.checkoutId, 2); } catch (caught) { error = caught; }
    expect(error.status).to.equal(404);
    expect(await Pedido.count()).to.equal(0);
  });
  it('rounds fees per order and rejects expired events or invalid quantities', () => {
    const item = { id: 1, cantidad: 1, producto: { id: 1, puestoId: 1, precio: 0.9 }, evento: { id: 1, estado: 'EnCurso' } };
    expect(buildCheckoutSnapshot([item]).amount).to.equal(104);
    expect(() => buildCheckoutSnapshot([{ ...item, cantidad: -1 }])).to.throw();
    expect(() => buildCheckoutSnapshot([{ ...item, evento: { id: 1, estado: 'Finalizado' } }])).to.throw();
  });
});
