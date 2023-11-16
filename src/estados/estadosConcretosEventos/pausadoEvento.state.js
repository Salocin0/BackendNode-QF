export const pausado = {
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
    throw new Error('No se puede iniciar un evento que no está "Confirmado"');
  },

  finalizarEvento: async (evento) => {
      throw new Error('No se puede finalizar un evento que no está "En Curso"');
  },

  reprogramarEvento: async (evento) => {
    evento.estado = 'En Preparacion';
    await evento.save();
    return evento;  },
};
