import { activo } from "../estadosPuestoDeComida/activoPuesto.state.js";
import { creado } from "../estadosPuestoDeComida/creadoPuesto.state.js";
import { deshabilitado } from "../estadosPuestoDeComida/deshabilitadoPuesto.state.js";
import { habilitado } from "../estadosPuestoDeComida/habilitadoPuesto.state.js";
import { inactivo } from "../estadosPuestoDeComida/inactivoPuesto.state.js";

export const estadosPuestoDeComida = {
    creado: {
        crearPuesto: async (puesto) => {
            return creado.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return creado.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return creado.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return creado.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return creado.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return creado.habilitar(puesto);
        }
    },

    habilitado: {
        crearPuesto: async (puesto) => {
            return habilitado.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return habilitado.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return habilitado.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return habilitado.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return habilitado.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return habilitado.habilitar(puesto);
        }
    },

    activo: {
        crearPuesto: async (puesto) => {
            return activo.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return activo.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return activo.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return activo.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return activo.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return activo.habilitar(puesto);
        }

    },

    deshabilitado: {
        crearPuesto: async (puesto) => {
            return deshabilitado.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return deshabilitado.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return deshabilitado.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return deshabilitado.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return deshabilitado.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return deshabilitado.habilitar(puesto);
        }


    },

    inactivo: {
        crearPuesto: async (puesto) => {
            return inactivo.crearPuesto(puesto);
        },
        validar: async (puesto) => {
            return inactivo.validar(puesto);
        },
        iniciarServicio: async (puesto) => {
            return inactivo.iniciarServicio(puesto);
        },
        finalizarServicio: async (puesto) => {
            return inactivo.finalizarServicio(puesto);
        },
        deshabilitar: async (puesto) =>{
            return inactivo.deshabilitar(puesto);
        },
        habilitar: async (puesto) => {
            return inactivo.habilitar(puesto);
        }
    },
};
