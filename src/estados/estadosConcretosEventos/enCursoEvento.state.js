export const enCurso = {
  crearEvento: async (evento) => {
    throw new Error('Error el evento ya ha sido creado');
  },

  confirmarEvento: async (evento) => {
    throw new Error('Error el evento ya esta "En Curso"');
  },

  cancelarEvento: async (evento) => {
    throw new Error('Error el evento no puedo ser cancelado estando "En Curso"');

  },

  iniciarEvento: async (evento) => {
    throw new Error('Error el evento ya está "En Curso"');

  },

  finalizarEvento: async (evento) => {
    evento.estado = 'Finalizado';
    await evento.save();
    return evento;    },

  reprogramarEvento: async (evento) => {
      throw new Error('No se puede reprogramar un evento directamente desde "En Curso"');
  },
};
