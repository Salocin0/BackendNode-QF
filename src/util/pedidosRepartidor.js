// Historial includes rated orders because rating happens after delivery.
export const estadosPedidosRepartidor = (incluirHistorial = false) =>
  incluirHistorial ? ['Entregado', 'Valorado'] : ['EnCamino', 'Entregado'];
