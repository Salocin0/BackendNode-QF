export const deshabilitado = {

    newProducto: async (producto) => {
        throw new Error('El producto ya ha sido creado');
    },

    publicar: async (producto) => {
        producto.estado = 'Publicado';
        await producto.save();
        return producto;
    },

    deshabilitar: async (producto) => {
        throw new Error('El producto ya está deshabilitado');
    },

    pausar: async (producto) => {
        producto.estado = 'Stand By';
        await producto.save();
        return producto;
    },

    eliminar: async (producto) => {
        producto.estado = 'Eliminado';
        await producto.save();
        return producto;
    },
    
  };
  