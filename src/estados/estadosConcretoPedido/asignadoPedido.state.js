export const asignado = {
  crearPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha creado');
  },

  tomarPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha tomado');
  },

  preparar: async (pedido) => {
    throw new Error('Error el pedido ya se ha prepardo');
  },

  pedidoPreparado: async (pedido) => {
    throw new Error('Error el pedido no se puede enviar');
  },

  pedidoEnCamino: async (pedido) => {
    pedido.estado = 'EnCamino';
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

  valorar: async (pedido) => {
    throw new Error('Error el pedido no se puede valorar');
  },
};
