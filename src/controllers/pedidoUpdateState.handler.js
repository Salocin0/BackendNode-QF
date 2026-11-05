// Labels sent by the Kanban board -> action names of the order state machine.
export const ACCION_POR_ETIQUETA = {
  Aceptado: 'aceptar',
  'En Preparación': 'preparar',
  'En Camino': 'enCamino',
  Cancelado: 'cancelar',
  Finalizado: 'finalizar',
};

/**
 * Builds POST /pedido/cambiarEstado/:id/:accion. Kept free of model imports so it can be unit tested with stubs.
 * `deps` is read lazily: { pedidoService, estadosPedido }.
 */
export const createUpdateStateHandler = (deps) => async (req, res) => {
  const pedidoId = req.params.id;
  const accion = ACCION_POR_ETIQUETA[req.params.accion] || req.params.accion;
  try {
    const pedido = await deps.pedidoService.getOne(pedidoId);
    if (!pedido) return res.status(404).json({ message: 'El pedido no existe.' });

    const transition = deps.estadosPedido[pedido.estado]?.[accion];
    if (!transition) return res.status(400).json({ message: 'No se encontró la acción para el estado actual.' });

    try {
      await transition(pedido);
    } catch (error) {
      // The state machine rejects forbidden transitions: that is a client error, not a server failure.
      return res.status(409).json({ message: error.message || 'La transición no está permitida.' });
    }

    if (accion === 'pedidoEntregado') {
      pedido.fechaEntrega = new Date();
      await pedido.save();
    }

    // The state already changed: a failing notification must not turn the response into an error.
    try {
      const { pedidoService } = deps;
      const consumidorId = pedido.consumidorId;
      if (accion === 'aceptar') await pedidoService.sendNotificacionesPedidoAceptado(consumidorId);
      if (accion === 'preparar') await pedidoService.sendNotificacionesPedidoPreparado(consumidorId);
      if (accion === 'enCamino') await pedidoService.sendNotificacionesPedidoEnCamino(consumidorId);
      if (accion === 'cancelar') await pedidoService.sendNotificacionesPedidoCancelado(pedido.puestoId, consumidorId);
      if (accion === 'pedidoEntregado') await pedidoService.sendNotificacionesPedidoEntregado(consumidorId);
      if (accion === 'valorar') await pedidoService.sendNotificacionesPedidoValorado(consumidorId);
    } catch (error) {
      console.error('No se pudo enviar la notificación del pedido:', error.message);
    }

    return res.status(200).json({ message: 'Estado del pedido actualizado.', data: { estado: pedido.estado } });
  } catch (error) {
    console.error('Error al cambiar el estado del pedido:', error);
    return res.status(500).json({ message: 'Error al cambiar el estado del pedido.' });
  }
};
