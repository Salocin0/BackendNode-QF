export const valorar = {
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
    throw new Error('Error el pedido ya se ha entregado');
  },

  cancelar: async (pedido) => {
    throw new Error('Error el pedido no se puede cancelar');
  },

  asignar: async (pedido) => {
    throw new Error('Error el pedido no se puede asignar');
  },

  valorar: async (pedido) => {
    throw new Error('Error el pedido no se puede valorar');
  },

};
