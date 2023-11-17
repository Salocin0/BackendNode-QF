export const publicado = {

    newProducto: async (producto) => {
        producto.estado = 'Stand By';
        await producto.save();
        return producto;
    },

    publicar: async (producto) => {
        producto.estado = 'Publicado';
        await producto.save();
        return producto;        
    },

    deshabilitar: async (producto) => {
        throw new Error('El producto no se puede deshabilitar');
    },

    pausar: async (producto) => {
        throw new Error('El producto ya se encuentra en standBy');

    },

    eliminar: async (producto) => {
        producto.estado = 'Eliminado';
        await producto.save();
        return producto;        
    },
    
  };
  