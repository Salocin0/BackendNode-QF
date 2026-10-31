import { sequelize } from '../util/connections.js';
import { CartCheckout } from '../DAO/models/cartCheckout.model.js';
import { Carrito } from '../DAO/models/carrito.model.js';
import { ItemCarrito } from '../DAO/models/itemCarrito.js';
import { Producto } from '../DAO/models/producto.model.js';
import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { getStripe } from '../services/payment.service.js';
import { createCartCheckoutService } from '../services/cartCheckout.core.js';
import { parsePositiveInteger } from '../util/validation.js';

const service = createCartCheckoutService({ sequelize, Checkout: CartCheckout, Carrito, ItemCarrito, Producto, Evento, Pedido, DetallePedido, getStripe, eventInclude: [{ model: DiaEvento }], notify: async (puestoId, consumidorId) => { const { pedidoService } = await import('../services/pedido.service.js'); return pedidoService.sendNotificacionesPedidoCreado(puestoId, consumidorId); } });
const handle = (action) => async (req, res) => {
  const consumerId = parsePositiveInteger(req.headers.consumidorid);
  if (!consumerId) return res.status(400).json({ error: 'Consumidor inválido' });
  try {
    const result = action === 'create' ? await service.create(consumerId) : await service[action](req.params.id, consumerId);
    return res.json(result);
  } catch (error) {
    console.error('Error en compra del carrito:', error.message);
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'No se pudo completar la compra. Podés volver a intentarlo.' });
  }
};
export const createCartCheckout = handle('create');
export const resumeCartCheckout = handle('resume');
export const completeCartCheckout = handle('complete');
