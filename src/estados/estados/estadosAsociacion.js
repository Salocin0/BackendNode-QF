import { Aceptada } from '../estadosConcretoAsociacion/aceptadaAsociacion.state.js';
import { Cancelada } from '../estadosConcretoAsociacion/canceladaAsociacion.state.js';
import { PendienteDeAceptacion } from '../estadosConcretoAsociacion/pendienteDeAceptacionAsociacion.state.js';
import { Rechazada } from '../estadosConcretoAsociacion/rechazadaAsociacion.state.js';

export const estadosAsociacion = {
  PendienteDeAceptacion: {
    newAsociacion: async (asociacion) => {
      return PendienteDeAceptacion.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return PendienteDeAceptacion.aceptar(asociacion);
    },

    rechazada: async (asociacion) => {
      return PendienteDeAceptacion.rechazada(asociacion);
    },

    cancelar: async (asociacion) => {
      return PendienteDeAceptacion.cancelar(asociacion);
    },
  },

  Aceptada: {
    newAsociacion: async (asociacion) => {
      return Aceptada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Aceptada.aceptar(asociacion);
    },

    rechazada: async (asociacion) => {
      return Aceptada.rechazada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Aceptada.cancelar(asociacion);
    },
  },

  Rechazada: {
    newAsociacion: async (asociacion) => {
      return Rechazada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Rechazada.aceptar(asociacion);
    },

    rechazada: async (asociacion) => {
      return Rechazada.rechazada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Rechazada.cancelar(asociacion);
    },
  },

  Cancelada: {
    newAsociacion: async (asociacion) => {
      return Cancelada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Cancelada.aceptar(asociacion);
    },

    rechazada: async (asociacion) => {
      return Cancelada.rechazada(asociacion);
    },
    
    cancelar: async (asociacion) => {
      return Cancelada.cancelar(asociacion);
    },
  },
};
