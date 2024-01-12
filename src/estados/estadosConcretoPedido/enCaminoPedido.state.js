export const enCamino = {
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
    throw new Error('Error el pedido ya se ha preparado');
  },

  pedidoEntregado: async (pedido) => {
    pedido.estado = 'Entregado';
    await pedido.save();
    return pedido;
  },

  cancelar: async (pedido) => {
    throw new Error('Error el pedido no se puede cancelar');
  },

  asignar: async (pedido) => {
    throw new Error('Error el pedido no se puede asignar');
  },
};
