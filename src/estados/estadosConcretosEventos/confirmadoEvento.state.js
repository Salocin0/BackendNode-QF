export const Confirmado = {
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
    evento.estado = 'EnCurso';
    await evento.save();
    return evento;
  },

  finalizarEvento: async (evento) => {
    throw new Error('No se puede finalizar un evento que no está "Confirmado"');
  },

  pausarEvento: async (evento) => {
    evento.estado = 'Pausado';
    await evento.save();
    return evento;
  },

  reprogramarEvento: async (evento) => {
    throw new Error('No se puede reprogramar un evento directamente desde "Confirmado"');
  },

  continuarEvento: async (evento) => {
    throw new Error('No se puede continuar un evento directamente desde "Confirmado"');
  }
};
