export const enPreparacion = {
  crearEvento: async (evento) => {
      evento.estado = 'En Preparación';
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

  iniciarEvento: async (evento) => {
      throw new Error('No se puede iniciar un evento directamente desde "En Preparación"');
  },

  finalizarEvento: async (evento) => {
      throw new Error('No se puede finalizar un evento directamente desde "En Preparación"');
  },

  reprogramarEvento: async (evento) => {
      throw new Error('No se puede reprogramar un evento directamente desde "En Preparación"');
  },
};
