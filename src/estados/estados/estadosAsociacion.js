import { aceptada } from "../estadosConcretoAsociacion/aceptadaAsociacion.state.js";
import { cancelada } from "../estadosConcretoAsociacion/canceladaAsociacion.state.js";
import { pendienteDeAceptacion } from "../estadosConcretoAsociacion/pendienteDeAceptacionAsociacion.state.js";
import { rechazada } from "../estadosConcretoAsociacion/rechazadaAsociacion.state.js";

export const estadosAsociacion = {
    pendienteDeAceptacion: {
        newAsociacion: async (asociacion) => {
            return pendienteDeAceptacion.newAsociacion(asociacion);
        },
        aceptar: async (asociacion) => {
            return pendienteDeAceptacion.aceptar(asociacion);
        },
        rechazada: async (asociacion) => {
            return pendienteDeAceptacion.rechazada(asociacion);
        },
        cancelada: async (asociacion) => {
            return pendienteDeAceptacion.cancelada(asociacion);
        },
    },

    aceptada: {
        newAsociacion: async (asociacion) => {
            return aceptada.newAsociacion(asociacion);
        },
        aceptar: async (asociacion) => {
            return aceptada.aceptar(asociacion);
        },
        rechazada: async (asociacion) => {
            return aceptada.rechazada(asociacion);
        },
        cancelada: async (asociacion) => {
            return aceptada.cancelada(asociacion);
        },
    },

    rechazada: {
        newAsociacion: async (asociacion) => {
            return rechazada.newAsociacion(asociacion);
        },
        aceptar: async (asociacion) => {
            return rechazada.aceptar(asociacion);
        },
        rechazada: async (asociacion) => {
            return rechazada.rechazada(asociacion);
        },
        cancelada: async (asociacion) => {
            return rechazada.cancelada(asociacion);
        },
    },

    cancelada: {
        newAsociacion: async (asociacion) => {
            return cancelada.newAsociacion(asociacion);
        },
        aceptar: async (asociacion) => {
            return cancelada.aceptar(asociacion);
        },
        rechazada: async (asociacion) => {
            return cancelada.rechazada(asociacion);
        },
        cancelada: async (asociacion) => {
            return cancelada.cancelada(asociacion);
        },
    },

};
