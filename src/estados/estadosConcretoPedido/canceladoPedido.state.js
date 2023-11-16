export const cancelado = {
    crearPedido: async (pedido) => {
        throw new Error('Error el pedido ya se ha cancelado');
    },
    tomarPedido: async (pedido) => {
        throw new Error('Error el pedido ya se ha cancelado');
    },
    preperar: async (pedido) => {
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
    }
};
  