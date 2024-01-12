export const listo = {
  crearPedido: async (pedido) => {
    throw new Error('Error el pedido no se puede crear');
  },

  tomarPedido: async (pedido) => {
    throw new Error('Error el pedido no se puede tomar');
  },

  preparar: async (pedido) => {
    throw new Error('Error el pedido no se puede preparar');
  },

  pedidoPreparado: async (pedido) => {
    throw new Error('Error el pedido no se puede terminar');
  },

  pedidoEntregado: async (pedido) => {
    throw new Error('Error el pedido no se puede entregar');
  },

  cancelar: async (pedido) => {
    throw new Error('Error el pedido no se puede cancelar');
  },

  asignar: async (pedido) => {
    pedido.estado = 'EnCamino';
    await pedido.save();
    return pedido;
  },
};
