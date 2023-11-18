export const entregado = {
    crearPedido: async (pedido) => {
        throw new Error('Error el pedido ya se ha creado');
    },

    tomarPedido: async (pedido) => {
        throw new Error('Error el pedido ya se ha tomado');
    },

    preperar: async (pedido) => {
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
    }
};
  