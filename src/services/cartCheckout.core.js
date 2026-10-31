import { isEventoFinalizado, parsePositiveInteger, parseIsoDate } from '../util/validation.js';

export class CheckoutError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const buildCheckoutSnapshot = (items) => {
  if (!items.length) throw new CheckoutError('Tu carrito está vacío');
  const groups = new Map();
  for (const item of items) {
    const product = item.producto;
    const event = item.evento;
    const quantity = parsePositiveInteger(item.cantidad);
    if (!parsePositiveInteger(product?.puestoId) || !parsePositiveInteger(event?.id)) throw new CheckoutError("Puesto o evento inválido");
    if (!product || product.estado === false || !event || isEventoFinalizado(event)) throw new CheckoutError('Hay productos o eventos que ya no están disponibles');
    if (!quantity || !Number.isFinite(Number(product.precio)) || Number(product.precio) < 0) throw new CheckoutError('Cantidad o precio inválidos');
    const date = item.fecha ? parseIsoDate(item.fecha) : null;
    if (item.fecha && !date) throw new CheckoutError('Fecha de precompra inválida');
    const key = JSON.stringify([event.id, product.puestoId, date?.toISOString() || null]);
    if (!groups.has(key)) groups.set(key, { puestoId: product.puestoId, eventoId: event.id, fechaPreCompra: date?.toISOString() || null, detalles: [], items: [], subtotalCents: 0 });
    const group = groups.get(key);
    group.detalles.push({ productoId: product.id, cantidad: quantity, precio: Number(product.precio) });
    group.items.push({ id: item.id, cantidad: quantity });
    group.subtotalCents += Math.round(Number(product.precio) * 100) * quantity;
  }
  const orders = [...groups.values()].map((group) => ({ ...group, totalCents: group.subtotalCents + Math.round(group.subtotalCents * 15 / 100) }));
  const amount = orders.reduce((sum, group) => sum + group.totalCents, 0);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 99999999) throw new CheckoutError('El importe del carrito no es válido para el pago');
  return { orders, amount };
};

export const createCartCheckoutService = (deps) => {
  const { sequelize, Checkout, Carrito, ItemCarrito, Producto, Evento, Pedido, DetallePedido, getStripe, notify } = deps;
  const owned = async (id, consumerId, options = {}) => {
    const checkout = await Checkout.findByPk(id, options);
    if (!checkout || Number(checkout.consumidorId) !== Number(consumerId)) throw new CheckoutError('Compra no encontrada', 404);
    return checkout;
  };
  return {
    async create(consumerId) {
      const cart = await Carrito.findOne({ where: { consumidorId: consumerId } });
      if (!cart) throw new CheckoutError('Tu carrito está vacío');
      const items = await ItemCarrito.findAll({ where: { carritoId: cart.id }, include: [{ model: Producto }, { model: Evento, include: deps.eventInclude || [] }], order: [['id', 'ASC']] });
      const snapshot = buildCheckoutSnapshot(items.map((item) => item.get ? item.get({ plain: true }) : item));
      const checkout = await Checkout.create({ consumidorId: consumerId, carritoId: cart.id, snapshot: snapshot.orders, amount: snapshot.amount });
      const intent = await getStripe().paymentIntents.create({ amount: snapshot.amount, currency: 'ars', metadata: { checkoutId: checkout.id, consumidorId: String(consumerId) } }, { idempotencyKey: `cart-checkout-${checkout.id}` });
      await checkout.update({ paymentIntentId: intent.id });
      return { checkoutId: checkout.id, clientSecret: intent.client_secret, amount: checkout.amount };
    },
    async resume(id, consumerId) {
      const checkout = await owned(id, consumerId);
      const intent = await getStripe().paymentIntents.retrieve(checkout.paymentIntentId);
      return { checkoutId: id, clientSecret: intent.client_secret, amount: checkout.amount, paid: intent.status === 'succeeded', completed: checkout.status === 'completed' };
    },
    async complete(id, consumerId) {
      const checkout = await owned(id, consumerId);
      if (checkout.status === 'completed') return checkout.result;
      const intent = await getStripe().paymentIntents.retrieve(checkout.paymentIntentId);
      if (intent.status !== 'succeeded') throw new CheckoutError('El pago todavía no está confirmado', 409);
      if (intent.amount_received !== checkout.amount || intent.currency !== 'ars' || intent.metadata?.checkoutId !== checkout.id) throw new CheckoutError('El pago no coincide con esta compra', 409);
      let created = false;
      const result = await sequelize.transaction(async (transaction) => {
        const locked = await owned(id, consumerId, { transaction, lock: transaction.LOCK.UPDATE });
        if (locked.status === 'completed') return locked.result;
        const orderIds = [];
        for (const group of locked.snapshot) {
          const order = await Pedido.create({ fecha: new Date(), consumidorId: consumerId, puestoId: group.puestoId, eventoId: group.eventoId, fechaPreCompra: group.fechaPreCompra, estado: group.fechaPreCompra ? 'Precomprado' : 'Pendiente', total: group.totalCents / 100 }, { transaction });
          await DetallePedido.bulkCreate(group.detalles.map((detail) => ({ ...detail, PedidoId: order.id })), { transaction });
          orderIds.push(order.id);
          for (const item of group.items) {
            const current = await ItemCarrito.findOne({ where: { id: item.id, carritoId: locked.carritoId }, transaction, lock: transaction.LOCK.UPDATE });
            if (!current) continue;
            if (Number(current.cantidad) > item.cantidad) await current.update({ cantidad: Number(current.cantidad) - item.cantidad }, { transaction });
            else await current.destroy({ transaction });
          }
        }
        const response = { orderIds, amount: locked.amount };
        await locked.update({ status: 'completed', result: response }, { transaction });
        created = true;
        return response;
      });
      if (created) await Promise.allSettled(checkout.snapshot.map((group) => Promise.resolve().then(() => notify(group.puestoId, consumerId))));
      return result;
    },
  };
};
