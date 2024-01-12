import { cancelado } from '../estadosConcretosEventos/canceladoEvento.state.js';
import { Confirmado } from '../estadosConcretosEventos/confirmadoEvento.state.js';
import { EnCurso } from '../estadosConcretosEventos/enCursoEvento.state.js';
import { EnPreparacion } from '../estadosConcretosEventos/enPreparacionEvento.state.js';
import { finalizado } from '../estadosConcretosEventos/finalizadoEvento.state.js';
import { Pausado } from '../estadosConcretosEventos/pausadoEvento.state.js';

export const estadosEvento = {
  EnPreparacion: {
    crearEvento: async (evento) => {
      return EnPreparacion.crearEvento(evento);
    },

    confirmarEvento: (evento) => {
      return EnPreparacion.confirmarEvento(evento);
    },

    cancelarEvento: (evento) => {
      return EnPreparacion.cancelarEvento(evento);
    },

    iniciarEvento: (evento) => {
      return EnPreparacion.iniciarEvento(evento);
    },

    finalizarEvento: (evento) => {
      return EnPreparacion.finalizarEvento(evento);
    },

    reprogramarEvento: (evento) => {
      return EnPreparacion.reprogramarEvento(evento);
    },

    activarEvento: (evento) => {
      return EnPreparacion.activarEvento(evento);
    },

    desactivarEvento: (evento) => {
      return EnPreparacion.desactivarEvento(evento);
    },

    continuarEvento: (evento) => {
      return EnPreparacion.continuarEvento(evento);
    },
  },

  EnCurso: {
    crearEvento: async (evento) => {
      return EnCurso.crearEvento(evento);
    },

    confirmarEvento: (evento) => {
      return EnCurso.confirmar(evento);
    },

    cancelarEvento: (evento) => {
      return EnCurso.cancelar(evento);
    },

    iniciarEvento: (evento) => {
      return EnCurso.iniciarEvento(evento);
    },

    finalizarEvento: (evento) => {
      return EnCurso.finalizarEvento(evento);
    },

    reprogramarEvento: (evento) => {
      return EnCurso.reprogramarEvento(evento);
    },

    activarEvento: (evento) => {
      return EnCurso.activarEvento(evento);
    },

    continuarEvento: (evento) => {
      return EnCurso.continuarEvento(evento);
    },
  },

  Confirmado: {
    crearEvento: async (evento) => {
      return Confirmado.crearEvento(evento);
    },

    confirmarEvento: (evento) => {
      return Confirmado.confirmar(evento);
    },

    cancelarEvento: (evento) => {
      return Confirmado.cancelar(evento);
    },

    iniciarEvento: (evento) => {
      return Confirmado.iniciarEvento(evento);
    },

    finalizarEvento: (evento) => {
      return Confirmado.finalizarEvento(evento);
    },

    reprogramarEvento: (evento) => {
      return Confirmado.reprogramarEvento(evento);
    },

    activarEvento: (evento) => {
      return Confirmado.activarEvento(evento);
    },

    desactivarEvento: (evento) => {
      return Confirmado.desactivarEvento(evento);
    },

    pausarEvento: (evento) => {
      return Confirmado.pausarEvento(evento);
    },

    continuarEvento: (evento) => {
      return Confirmado.continuarEvento(evento);
    },
  },

  Pausado: {
    crearEvento: async (evento) => {
      return Pausado.crearEvento(evento);
    },

    confirmarEvento: (evento) => {
      return Pausado.confirmar(evento);
    },

    cancelarEvento: (evento) => {
      return Pausado.cancelarEvento(evento);
    },

    iniciarEvento: (evento) => {
      return Pausado.iniciarEvento(evento);
    },

    finalizarEvento: (evento) => {
      return Pausado.finalizarEvento(evento);
    },

    reprogramarEvento: (evento) => {
      return Pausado.reprogramarEvento(evento);
    },

    activarEvento: (evento) => {
      return Pausado.activarEvento(evento);
    },

    desactivarEvento: (evento) => {
      return Pausado.desactivarEvento(evento);
    },

    continuarEvento: (evento) => {
      return Pausado.continuarEvento(evento);
    },
  },

  cancelado: {
    crearEvento: async (evento) => {
      return cancelado.crearEvento(evento);
    },
    
    confirmarEvento: (evento) => {
      return cancelado.confirmar(evento);
    },

    cancelarEvento: (evento) => {
      return cancelado.cancelar(evento);
    },

    iniciarEvento: (evento) => {
      return cancelado.iniciarEvento(evento);
    },

    finalizarEvento: (evento) => {
      return cancelado.finalizarEvento(evento);
    },

    reprogramarEvento: (evento) => {
      return cancelado.reprogramarEvento(evento);
    },

    activarEvento: (evento) => {
      return cancelado.activarEvento(evento);
    },

    desactivarEvento: (evento) => {
      return cancelado.desactivarEvento(evento);
    },

    continuarEvento: (evento) => {
      return cancelado.continuarEvento(evento);
    },
  },

  finalizado: {
    crearEvento: async (evento) => {
      return finalizado.crearEvento(evento);
    },

    confirmarEvento: (evento) => {
      return finalizado.confirmar(evento);
    },

    cancelarEvento: (evento) => {
      return finalizado.cancelar(evento);
    },

    iniciarEvento: (evento) => {
      return finalizado.iniciarEvento(evento);
    },

    finalizarEvento: (evento) => {
      return finalizado.finalizarEvento(evento);
    },

    reprogramarEvento: (evento) => {
      return finalizado.reprogramarEvento(evento);
    },

    activarEvento: (evento) => {
      return finalizado.activarEvento(evento);
    },

    desactivarEvento: (evento) => {
      return finalizado.desactivarEvento(evento);
    },
    
    continuarEvento: (evento) => {
      return finalizado.continuarEvento(evento);
    },
  },
};
