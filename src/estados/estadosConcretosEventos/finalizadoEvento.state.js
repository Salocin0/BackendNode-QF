export const finalizado = {
    crearEvento: async (evento) => {
      evento.estado = 'enPreparacion';
      await evento.save();
      return evento;
    },

    confirmar: async (evento) => {
      evento.estado = 'confirmar';
      await evento.save();
      return evento;
    }




  };
