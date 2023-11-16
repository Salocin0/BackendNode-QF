export const PendienteDeValidacion = {
    crearUsuario: async (usuario) => {
        throw new Error('El usuario ya está creado');
    },
  
    solicitarRol: async (usuario) => {
        throw new Error('No se puede solicitar un rol');
    },

    rechazar: async (usuario) => {
        usuario.estado = 'Creado';
        usuario.rol = 'Consumidor'
        await usuario.save();
        return usuario;    
    },

    validar: async (usuario,nuevoRol) => {
        usuario.estado = 'Validado';
        usuario.rol = nuevoRol;
        await usuario.save();
        return usuario;        
    },
    modificarRol: async (usuario,rolActual,nuevoRol) => {
        throw new Error('No se puede modificar el rol de la solicitud');
    },
    cancelarRol: async (usuario,rolActual) => {
        throw new Error('No se puede cancelar el rol de  la solicitud');
    },
    deshabilitar: async (usuario) => {
        throw new Error('No se puede deshabilitar el usuario, ya que se encuentra en ese estado');
    },

    habilitarCreado: async (usuario,estado) => {
        throw new Error('No se puede habilitar el usuario.');
    },
    habilitarValidado: async (usuario,estado) => {
        throw new Error('No se puede habilitar el usuario.');
    },

};
  