export const aceptado = {
    crearPedido: async (pedido) => {
        throw new Error('Error el pedido ya se ha creado');
    },
    tomarPedido: async (pedido) => {
        throw new Error('Error el pedido ya se ha tomado');
    },
    preperar: async (pedido) => {
        pedido.estado = 'En Preparacion';
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
        await pedido.save();
        return pedido;    
    }
};
  