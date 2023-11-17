export const pendienteDeAceptacion = {

    newAsociacion: async (asociacion) => {
        asociacion.estado = 'Pendiente de Aceptacion';
        await asociacion.save();
        return asociacion;    
    },

    aceptar: async (asociacion) => {
        asociacion.estado = 'Aceptada';
        await asociacion.save();
        return asociacion;    
    },

    rechazada: async (asociacion) => {
        asociacion.estado = 'Rechazada';
        await asociacion.save();
        return asociacion;    
    },

    cancelada: async (asociacion) => { 
        asociacion.estado = 'Cancelada';
        await asociacion.save();
        return asociacion;    
    },
};
  