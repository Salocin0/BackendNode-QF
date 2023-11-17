export const enPreparacion = {
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
        pedido.estado = 'En Camino';
        await pedido.save();
        return pedido; 
    },

    pedidoEntregado: async (pedido) => {
        throw new Error('Error el pedido no se puede entregar');
    },

    cancelar: async (pedido) => {
        throw new Error('Error el pedido no se puede cancelar');
    }
};
  