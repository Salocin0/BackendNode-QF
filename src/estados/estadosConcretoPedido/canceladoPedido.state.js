export const cancelado = {
  crearPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha cancelado');
  },
  tomarPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha cancelado');
  },
  preparar: async (pedido) => {
    throw new Error('Error el pedido ya se ha cancelado');
  },

  pedidoPreparado: async (pedido) => {
    throw new Error('Error el pedido ya se ha cancelado');
  },

  pedidoEntregado: async (pedido) => {
    throw new Error('Error el pedido ya se ha cancelado');
  },

  cancelar: async (pedido) => {
    throw new Error('Error el pedido ya se ha cancelado');
  },

  asignar: async (pedido) => {
    throw new Error('Error el pedido no se puede asignar');
  },

  valorar: async (pedido) => {
    throw new Error('Error el pedido no se puede valorar');
  },
};
