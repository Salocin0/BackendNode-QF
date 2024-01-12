export const Activo = {
  crearPuesto: async (puesto) => {
    throw new Error('El puesto ya ha sido creado');
  },

  validar: async (puesto) => {
    throw new Error('El puesto ya esta validado');
  },

  iniciarServicio: async (puesto) => {
    throw new Error('El puesto ya esta activo');
  },

  finalizarServicio: async (puesto) => {
    puesto.estado = 'Inactivo';
    await puesto.save();
    return puesto;
  },

  deshabilitar: async (puesto) => {
    puesto.estado = 'Deshabilitado';
    await puesto.save();
    return puesto;
  },

  habilitar: async (puesto) => {
    throw new Error('El puesto ya esta habilitado ');
  },
};
