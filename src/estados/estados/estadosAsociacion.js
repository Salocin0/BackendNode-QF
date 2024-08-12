import { Aceptada } from "../estadosConcretoAsociacion/aceptadaAsociacion.state.js";
import { Cancelada } from "../estadosConcretoAsociacion/canceladaAsociacion.state.js";
import { Cerrada } from "../estadosConcretoAsociacion/cerradaAsociacion.state.js";
import { Confirmada } from "../estadosConcretoAsociacion/confirmadaAsociacion.state.js";
import { PendienteDeAceptacion } from "../estadosConcretoAsociacion/pendienteDeAceptacionAsociacion.state.js";
import { Retornada } from "../estadosConcretoAsociacion/retornadaAsociacion.state.js";

export const estadosAsociacion = {
  PendienteDeAceptacion: {
    newAsociacion: async (asociacion) => {
      return PendienteDeAceptacion.newAsociacion(asociacion);
    },

    aceptar: async (asociacion,asociacionId) => {
      return PendienteDeAceptacion.aceptar(asociacion,asociacionId);
    },

    rechazada: async (asociacion,asociacionId) => {
      return PendienteDeAceptacion.rechazada(asociacion,asociacionId);
    },

    cancelar: async (asociacion) => {
      return PendienteDeAceptacion.cancelar(asociacion);
    },

    cerrada: async (asociacion) => {
      return PendienteDeAceptacion.cerrada(asociacion);
    },

    confirmada: async (asociacion) => {
      return PendienteDeAceptacion.confirmada(asociacion);
    },
  },

  Aceptada: {
    newAsociacion: async (asociacion) => {
      return Aceptada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Aceptada.aceptar(asociacion);
    },

    retornada: async (asociacion) => {
      return Aceptada.retornada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Aceptada.cancelar(asociacion);
    },

    cerrada: async (asociacion) => {
      return Aceptada.cerrada(asociacion);
    },

    confirmada: async (asociacion) => {
      return Aceptada.confirmada(asociacion);
    },
  },

  Retornada: {
    newAsociacion: async (asociacion) => {
      return Retornada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Retornada.aceptar(asociacion);
    },

    retornada: async (asociacion) => {
      return Retornada.retornada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Retornada.cancelar(asociacion);
    },

    cerrada: async (asociacion) => {
      return Retornada.cerrada(asociacion);
    },

    confirmada: async (asociacion) => {
      return Retornada.confirmada(asociacion);
    },
  },

  Cerrada: {
    newAsociacion: async (asociacion) => {
      return Cerrada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Cerrada.aceptar(asociacion);
    },

    retornada: async (asociacion) => {
      return Cerrada.retornada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Cerrada.cancelar(asociacion);
    },

    cerrada: async (asociacion) => {
      return Cerrada.cerrada(asociacion);
    },

    confirmada: async (asociacion) => {
      return Cerrada.confirmada(asociacion);
    },
  },

  

  Confirmada: {
    newAsociacion: async (asociacion) => {
      return Confirmada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Confirmada.aceptar(asociacion);
    },

    retornada: async (asociacion) => {
      return Confirmada.retornada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Confirmada.cancelar(asociacion);
    },

    cerrada: async (asociacion) => {
      return Confirmada.cerrada(asociacion);
    },

    confirmada: async (asociacion) => {
      return Confirmada.confirmada(asociacion);
    },
  },

  Cancelada: {
    newAsociacion: async (asociacion) => {
      return Cancelada.newAsociacion(asociacion);
    },

    aceptar: async (asociacion) => {
      return Cancelada.aceptar(asociacion);
    },

    retornada: async (asociacion) => {
      return Cancelada.retornada(asociacion);
    },

    cancelar: async (asociacion) => {
      return Cancelada.cancelar(asociacion);
    },

    cerrada: async (asociacion) => {
      return Cancelada.cerrada(asociacion);
    },

    confirmada: async (asociacion) => {
      return Cancelada.confirmada(asociacion);
    },
  },
};
