export const aceptado = {
  crearPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha creado');
  },

  tomarPedido: async (pedido) => {
    throw new Error('Error el pedido ya se ha tomado');
  },

  preparar: async (pedido) => {
    pedido.estado = 'EnPreparacion';
    await pedido.save();
    return pedido;
  },

  pedidoPreparado: async (pedido) => {
    throw new Error('Error el pedido no se puede enviar');
  },

  pedidoEntregado: async (pedido) => {
    throw new Error('Error el pedido no se puede entregar');
  },

  cancelar: async (pedido) => {
    pedido.estado = 'Cancelado';
    console.log("leggggggggggggggggg")
    await pedido.save();
    return pedido;
  },

  asignar: async (pedido) => {
    throw new Error('Error el pedido no se puede asignar');
  },

  valorar: async (pedido) => {
    throw new Error('Error el pedido no se puede valorar');
  },
};
