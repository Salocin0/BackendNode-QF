export const validado = {
    crearUsuario: async (usuario) => {
        throw new Error('El usuario ya está creado');
    },
  
    solicitarRol: async (usuario) => {
        throw new Error('No se puede solicitar un rol');
    },

    rechazar: async (usuario) => {
        throw new Error('No se puede rechazar la solicitud');
    },

    validar: async (usuario,nuevoRol) => {
        throw new Error('No se puede validar la solicitud');
    },

    modificarRol: async (usuario,rolActual,nuevoRol) => { //ver
        usuario.estado = 'PendienteDeValidacion';
        usuario.rol = rolActual;
        await usuario.save();
        return usuario;       
    },

    cancelarRol: async (usuario,rolActual) => { //ver
        usuario.estado = 'Creado';
        usuario.rol = 'Consumidor';
        await usuario.save();
        return usuario;        
    },
    
    deshabilitar: async (usuario) => {
        usuario.estado = 'Deshabilitado';
        await usuario.save();
        return usuario;       },

    habilitarCreado: async (usuario,estado) => {
        throw new Error('No se puede habilitar el usuario.');
    },
    habilitarValidado: async (usuario,estado) => {
        throw new Error('No se puede habilitar el usuario.');
    },

};
  