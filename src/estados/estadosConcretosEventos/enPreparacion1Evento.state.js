import { cancelarPedidosPendientes } from './pedidoUtils.js';
import { TransicionEventoError, MENSAJE_EVENTO_INCOMPLETO } from './transicionEventoError.js';

export const EnPreparacion1 = {
    crearEvento: async (evento) => {
      evento.estado = 'EnPreparacion1';
      await evento.save();
      return evento;
    },

    // A draft still misses steps of the creation wizard: it becomes confirmable once it reaches EnPreparacion.
    confirmarEvento: async () => {
      throw new TransicionEventoError(MENSAJE_EVENTO_INCOMPLETO);
    },

    cancelarEvento: async (evento) => {
      evento.estado = 'Cancelado';
      cancelarPedidosPendientes(evento.id);
      await evento.save();
      return evento;
    },

    actualizarEvento: async (evento) => {
        evento.estado = 'EnPreparacion2';
        await evento.save();
        return evento;
      },

    iniciarEvento: async (evento) => {
      throw new Error('No se puede iniciar un evento directamente desde "En Preparacion"');
    },

    finalizarEvento: async (evento) => {
      throw new Error('No se puede finalizar un evento directamente desde "En Preparacion"');
    },

    reprogramarEvento: async (evento) => {
      throw new Error('No se puede reprogramar un evento directamente desde "En Preparacion"');
    },

    continuarEvento: async (evento) => {
      throw new Error('No se puede continuar un evento directamente desde "En Preparacion"');
    }

  };
