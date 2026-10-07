import { isEventoFinalizado, parseIsoDate, parsePositiveInteger } from '../util/validation.js';

// Service fee added on top of the products subtotal (the cart UI uses the same 15%).
export const COMISION_SERVICIO = 0.15;

/**
 * Builds the POST /pedido handler. Kept in its own module (no service imports) so it can be unit
 * tested with stubbed services; `deps` is read lazily on every request.
 */
export const createPedidoHandler = (deps) => async (req, res) => {
  const fail = (status, msg) => res.status(status).json({ status: 'error', msg, code: status, data: {} });
  try {
    const { detalles, puestoId: rawPuestoId, precompra, eventoId: rawEventoId } = req.body || {};

    // The consumer comes from the request header (existing contract); the body is only a legacy fallback.
    const consumidorId = parsePositiveInteger(req.headers?.['consumidorid'] ?? req.body?.consumidorId);
    const puestoId = parsePositiveInteger(rawPuestoId);
    const eventoId = parsePositiveInteger(rawEventoId);

    if (!consumidorId) return fail(400, 'consumidorId es obligatorio y debe ser válido');
    if (!puestoId) return fail(400, 'puestoId es obligatorio y debe ser válido');
    if (!eventoId) return fail(400, 'eventoId es obligatorio y debe ser válido');

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return fail(400, 'El pedido debe incluir al menos un producto');
    }
    const detallesValidos = detalles.map((detalle) => ({
      productoId: parsePositiveInteger(detalle?.productoId),
      cantidad: parsePositiveInteger(detalle?.cantidad),
      aderezos: detalle?.aderezos,
    }));
    if (detallesValidos.some((detalle) => !detalle.productoId || !detalle.cantidad)) {
      return fail(400, 'Cada producto debe tener productoId y cantidad enteros positivos');
    }

    // Only ISO dates are accepted for the pre-purchase date.
    const fechaPreCompra = precompra ? parseIsoDate(precompra) : null;
    if (precompra && !fechaPreCompra) return fail(400, 'precompra debe ser una fecha ISO válida');

    // Orders cannot be placed for events that do not exist or already finished/were cancelled.
    const evento = await deps.eventoService.getOne(eventoId);
    if (!evento) return fail(404, 'El evento no existe');
    if (isEventoFinalizado(evento)) return fail(400, 'El evento ya finalizó: no se pueden realizar pedidos');

    // Prices come from the database, never from the request body.
    let subtotal = 0;
    const detallesPedido = [];
    for (const detalle of detallesValidos) {
      const producto = await deps.productoService.getOne(detalle.productoId);
      if (!producto) return fail(404, `El producto ${detalle.productoId} no existe`);
      if (Number(producto.puestoId) !== puestoId) {
        return fail(400, `El producto ${detalle.productoId} no pertenece al puesto indicado`);
      }
      subtotal += Number(producto.precio) * detalle.cantidad;
      detallesPedido.push({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precio: Number(producto.precio),
        aderezos: detalle.aderezos,
      });
    }
    const total = Math.round(subtotal * (1 + COMISION_SERVICIO) * 100) / 100;

    const nuevoPedido = {
      fecha: Date.now(),
      consumidorId,
      total,
      estado: precompra ? 'Precomprado' : 'Pendiente',
      puestoId,
      eventoId,
      fechaPreCompra,
    };

    const pedidoCreado = await deps.pedidoService.create(nuevoPedido, detallesPedido);
    if (pedidoCreado === false) return fail(400, 'Producto used');

    await deps.pedidoService.sendNotificacionesPedidoCreado(puestoId, consumidorId);

    return res.status(200).json({
      status: 'success',
      msg: 'Producto created',
      code: 200,
      data: pedidoCreado,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      code: 500,
      data: {},
    });
  }
};
