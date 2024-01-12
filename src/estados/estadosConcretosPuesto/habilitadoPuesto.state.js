export const Habilitado = {
  crearPuesto: async (puesto) => {
    throw new Error('El puesto ya ha sido creado');
  },

  validar: async (puesto) => {
    throw new Error('El puesto ya ha sido validado');
  },

  iniciarServicio: async (puesto) => {
    puesto.estado = 'Activo';
    await puesto.save();
    return puesto;
  },

  finalizarServicio: async (puesto) => {
    throw new Error('No se puede finalizar el servicio');
  },

  deshabilitar: async (puesto) => {
    puesto.estado = 'Deshabilitado';
    await puesto.save();
    return puesto;
  },

  habilitar: async (puesto) => {
    throw new Error('No se puede habilitar el puesto');
  },
};
