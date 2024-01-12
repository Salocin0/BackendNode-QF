export const Rechazada = {
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
    asociacion.estado = 'PendienteDeAceptacion';
    await asociacion.save();
    return asociacion;
  },
};
