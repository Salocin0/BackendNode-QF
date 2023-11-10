import { deshabilitado } from './estadosProducto/deshabilitado.js';
import { eliminado } from './estadosProducto/eliminado.js';
import { publicado } from './estadosProducto/publicado.js';
import { standBy } from './estadosProducto/standBy.js';

export const estadosProducto = {
    standBy: {
        newProducto: async (producto) => {
            return standBy.newProducto(producto);
        },
        publicar: async (producto) => {
            return standBy.publicar(producto);
        },
        deshabilitar: async (producto) => {
            return standBy.deshabilitar(producto);
        },
        pausar: async (producto) => {
            return standBy.pausar(producto);
        },
        eliminar: async (producto) => {
            return standBy.eliminar(producto);
        },
    },

    publicado: {
        newProducto: async (producto) => {
            return standBy.newProducto(producto);
        },
        publicar: async (producto) => {
            return publicado.publicar(producto);
        },
        deshabilitar: async (producto) => {
            return publicado.deshabilitar(producto);
        },
        pausar: async (producto) => {
            return publicado.pausar(producto);
        },
        eliminar: async (producto) => {
            return publicado.eliminar(producto);
        },
    },

    
    deshabilitado: {
        newProducto: async (producto) => {
            return standBy.newProducto(producto);
        },
        publicar: async (producto) => {
            return deshabilitado.publicar(producto);
        },
        deshabilitar: async (producto) => {
            return deshabilitado.deshabilitar(producto);
        },
        pausar: async (producto) => {
            return deshabilitado.pausar(producto);
        },
        eliminar: async (producto) => {
            return deshabilitado.eliminar(producto);
        },
    },

    eliminado: {
        newProducto: async (producto) => {
            return standBy.newProducto(producto);
        },
        publicar: async (producto) => {
            return eliminado.publicar(producto);
        },
        deshabilitar: async (producto) => {
            return eliminado.deshabilitar(producto);
        },
        pausar: async (producto) => {
            return eliminado.pausar(producto);
        },
        eliminar: async (producto) => {
            return eliminado.eliminar(producto);
        },
    },


};
