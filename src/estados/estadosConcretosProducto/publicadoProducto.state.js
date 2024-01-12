export const publicado = {
  newProducto: async (producto) => {
    throw new Error('El producto ya ha sido creado');
  },

  publicar: async (producto) => {
    throw new Error('El producto ya está publicado');
  },

  deshabilitar: async (producto) => {
    producto.estado = 'Deshabilitado';
    await producto.save();
    return producto;
  },

  pausar: async (producto) => {
    producto.estado = 'Stand By';
    await producto.save();
    return producto;
  },

  eliminar: async (producto) => {
    throw new Error('El producto debe estar deshabilitado para eliminar');
  },
};
