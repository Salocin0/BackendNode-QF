export const PendienteDeAceptacion = {

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

    rechazar: async (asociacion) => {
        asociacion.estado = 'Rechazada';
        await asociacion.save();
        return asociacion;    
    },

    cancelar: async (asociacion) => {
        asociacion.estado = 'Cancelada';
        console.log("ENTRE LOCO");
        await asociacion.save();
        return asociacion;    
    },
};
  