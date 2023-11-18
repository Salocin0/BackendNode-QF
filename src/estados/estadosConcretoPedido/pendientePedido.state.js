export const pendiente = {
    crearPedido: async (pedido) => {
        pedido.estado = 'Pendiente';
        await pedido.save();
        return pedido;     
    },

    tomarPedido: async (pedido) => {
        pedido.estado = 'Aceptado';
        await pedido.save();
        return pedido;        
    },

    preperar: async (pedido) => {
        throw new Error('Error el pedido no se puede preperar');
    },

    pedidoPreparado: async (pedido) => {
        throw new Error('Error el pedido no se puede preperar');
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
  