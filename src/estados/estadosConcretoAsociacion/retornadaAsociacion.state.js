export const Retornada = {
  newAsociacion: async (asociacion) => {
    asociacion.estado = 'Pendiente';
    await asociacion.save();
    return asociacion;
  },

  aceptar: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  retornada: async (asociacion) => {
    throw new Error('Error en el estado de la retornada');
  },

  confirmada: async (asociacion) => {
    throw new Error('Error en el estado de la confirmada');
  },

  cerrada: async (asociacion) => {
    asociacion.estado = 'Cerrada';
    await asociacion.save();
    return asociacion;
  },

  cancelar: async (asociacion) => {
    asociacion.estado = 'Cancelada';
    await asociacion.save();
    return asociacion;
  },
};
