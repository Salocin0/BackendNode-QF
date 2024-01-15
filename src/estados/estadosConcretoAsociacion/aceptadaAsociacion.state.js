export const Aceptada = {
  newAsociacion: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  aceptar: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  rechazada: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  cancelar: async (asociacion) => {
    asociacion.estado = 'Cancelada';
    await asociacion.save();
    return asociacion;
  },
};
