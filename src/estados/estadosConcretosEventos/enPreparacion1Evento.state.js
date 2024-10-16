export const EnPreparacion1 = {
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
