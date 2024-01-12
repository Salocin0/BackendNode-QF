export const enPreparacion = {
  crearPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha creado');
  },

  tomarPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha tomado');
  },

  preparar: async (pedido) => {
    throw new Error('Error el pedido ya se ha preparado');
  },

  pedidoPreparado: async (pedido) => {
    pedido.estado = 'Listo';
    await pedido.save();
    return pedido;
  },

  pedidoEntregado: async (pedido) => {
    throw new Error('Error el pedido no se puede entregar');
  },

  cancelar: async (pedido) => {
    throw new Error('Error el pedido no se puede cancelar');
  },

  asignar: async (pedido) => {
    throw new Error('Error el pedido no se puede asignar');
  },
};
