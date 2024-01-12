export const creado = {
  crearUsuario: async (usuario) => {
    usuario.estado = 'Creado';
    usuario.rol = 'Consumidor';
    await usuario.save();
    return usuario;
  },

  solicitarRol: async (usuario) => {
    usuario.estado = 'PendienteDeValidacion';
    await usuario.save();
    return usuario;
  },

  rechazar: async (usuario) => {
    throw new Error('No se puede rechazar la solicitud');
  },

  validar: async (usuario) => {
    throw new Error('No se puede validar la solicitud');
  },

  modificarRol: async (usuario, rolActual, nuevoRol) => {
    throw new Error('No se puede modificar el rol de la solicitud');
  },

  cancelarRol: async (usuario, rolActual) => {
    throw new Error('No se puede cancelar el rol de  la solicitud');
  },

  deshabilitar: async (usuario) => {
    usuario.estado = 'Deshabilitado';
    await usuario.save();
    return usuario;
  },

  habilitar: async (usuario) => {
    throw new Error('No se puede habilitar el usuario de  la solicitud');
  },
};
