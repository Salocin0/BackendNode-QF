export const confirmado = {
  crearEvento: async (evento) => {
    throw new Error('Error el evento ya ha sido creado');
  },

  confirmarEvento: async (evento) => {
    throw new Error('Error el evento ya se ha confirmado');
  },

  cancelarEvento: async (evento) => {
      evento.estado = 'Cancelado';
      await evento.save();
      return evento;
  },

  iniciarEvento: async (evento) => {
    evento.estado = 'En Curso';
    await evento.save();
    return evento;
  },

  finalizarEvento: async (evento) => {
      throw new Error('No se puede finalizar un evento que no está "En Curso"');
  },

  reprogramarEvento: async (evento) => {
      throw new Error('No se puede reprogramar un evento directamente desde "En Curso"');
  },
};
