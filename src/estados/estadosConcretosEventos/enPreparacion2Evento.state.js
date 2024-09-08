import { Evento } from "../../DAO/models/evento.model.js";

export const EnPreparacion2 = {
    crearEvento: async (evento) => {
      evento.estado = 'EnPreparacion1';
      await evento.save();
      return evento;
    },

    confirmarEvento: async (evento) => {
      evento.estado = 'Confirmado';
      await evento.save();
      return evento;
    },

    cancelarEvento: async (evento) => {
      evento.estado = 'Cancelado';
      await evento.save();
      return evento;
    },

    actualizarEvento: async (id) => {
        try {
            const evento = await Evento.findByPk(id);

            if (!evento) {
              throw new Error('Evento no encontrado');
            }

            evento.estado = 'EnPreparacion3';
            await evento.save();
            return evento;
          } catch (error) {
            console.error('Error al actualizar el evento:', error);
            throw error;
          }
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
