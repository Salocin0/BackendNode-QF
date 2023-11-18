import { Activo } from "../estadosConcretosPuesto/activoPuesto.state.js";
import { Creado } from "../estadosConcretosPuesto/creadoPuesto.state.js";
import { Deshabilitado } from "../estadosConcretosPuesto/deshabilitadoPuesto.state.js";
import { Habilitado } from "../estadosConcretosPuesto/habilitadoPuesto.state.js";
import { Inactivo } from "../estadosConcretosPuesto/inactivoPuesto.state.js";


export const estadosPuestoDeComida = {
    Creado: {
        crearPuesto: async (puesto) => {
            return Creado.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return Creado.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return Creado.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return Creado.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return Creado.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return Creado.habilitar(puesto);
        }
    },

    Habilitado: {
        crearPuesto: async (puesto) => {
            return Habilitado.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return Habilitado.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return Habilitado.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return Habilitado.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return Habilitado.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return Habilitado.habilitar(puesto);
        }
    },

    Activo: {
        crearPuesto: async (puesto) => {
            return Activo.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return Activo.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return Activo.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return Activo.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return Activo.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return Activo.habilitar(puesto);
        }

    },

    Deshabilitado: {
        crearPuesto: async (puesto) => {
            return Deshabilitado.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return Deshabilitado.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return Deshabilitado.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return Deshabilitado.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return Deshabilitado.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return Deshabilitado.habilitar(puesto);
        }


    },

    Inactivo: {
        crearPuesto: async (puesto) => {
            return Inactivo.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return Inactivo.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return Inactivo.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return Inactivo.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return Inactivo.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return Inactivo.habilitar(puesto);
        }
    },
};
