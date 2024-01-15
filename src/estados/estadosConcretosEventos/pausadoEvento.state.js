export const Pausado = {
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
    throw new Error('No se puede iniciar un evento que no está "Pausado"');
  },

  finalizarEvento: async (evento) => {
    throw new Error('No se puede finalizar un evento que no está "Pausado"');
  },

  reprogramarEvento: async (evento) => {
    evento.estado = 'EnPreparacion';
    await evento.save();
    return evento;
  },

  continuarEvento: async (evento) => {
    throw new Error('No se puede continuar un evento directamente desde "Pausado"');
  }
};
