export const precomprado = {
    crearPedido: async (pedido) => {
      throw new Error('Error el pedido ya se ha creado en preventa');
    },
  
    tomarPedido: async (pedido) => {
      throw new Error('Error el pedido aún no se puede tomar en preventa');
    },
  
    preparar: async (pedido) => {
      throw new Error('Error el pedido no se puede preparar directamente desde preventa');
    },
  
    pedidoPreparado: async (pedido) => {
      throw new Error('Error el pedido no se puede marcar como preparado desde preventa');
    },
  
    pedidoEntregado: async (pedido) => {
      throw new Error('Error el pedido no se puede entregar directamente desde preventa');
    },
  
    cancelar: async (pedido) => {
        throw new Error('Error el pedido no se puede cancelar directamente desde preventa');
    },
  
    asignar: async (pedido) => {
      throw new Error('Error el pedido no se puede asignar desde preventa');
    },
  
    valorar: async (pedido) => {
      throw new Error('Error el pedido no se puede valorar directamente desde preventa');
    },
  
    aceptar: async (pedido) => {
      pedido.estado = 'Aceptado';
      await pedido.save();
      return pedido;
    },
  };
  