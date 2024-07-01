export const Pendiente = {
  newAsociacion: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  aceptar: async (asociacion) => {
    asociacion.estado = 'Aceptada';
    await asociacion.save();
    return asociacion;
  },

  retornada: async (asociacion) => {
    asociacion.estado = 'Retornada';

    await asociacion.save();
    return asociacion;
  },

  cancelar: async (asociacion) => {
    asociacion.estado = 'Cancelada';
    await asociacion.save();
    return asociacion;
  },

  confirmada: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  cerrada: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },
};
