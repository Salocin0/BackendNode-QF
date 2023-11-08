export const enCurso = {
  crearEvento: async (evento) => {
    throw new Error('No se puede crear un evento que ya esta en curso.');
  },

  confirmarEvento: async (evento) => {
    throw new Error('El evento ya esta confirmado.');
  },

  cancelarEvento: async (evento) => {
    throw new Error('No se puede cancelar un evento que está en curso.');

  },

  iniciarEvento: async (evento) => {
      throw new Error('No se puede iniciar un evento que ya se encuentra en curso');
  },

  finalizarEvento: async (evento) => {
    evento.estado = 'Finalizado';
    await evento.save();
    return evento;  },

  reprogramarEvento: async (evento) => {
      throw new Error('No se puede reprogramar un evento que está en curso');
  },
};
