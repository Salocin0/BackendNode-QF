export const cancelado = {
  crearEvento: async (evento) => {
    throw new Error('Error el evento ya ha sido creado');
  },

  confirmarEvento: async (evento) => {
    throw new Error('Error el evento ya se ha confirmado');
  },

  cancelarEvento: async (evento) => {
    throw new Error('Error el evento está en estado "Cancelado');
  },

  iniciarEvento: async (evento) => {
    throw new Error('Error el evento no puede ser iniciado');
  },

  finalizarEvento: async (evento) => {
    throw new Error('Error el evento no puede ser finalizado ya que no está "Cancelado"');
  },

  reprogramarEvento: async (evento) => {
    throw new Error('No se puede reprogramar un evento directamente desde "Cancelado"');
  },

  continuarEvento: async (evento) => {
    throw new Error('No se puede continuar un evento directamente desde "Cancelado"');
  }
};
