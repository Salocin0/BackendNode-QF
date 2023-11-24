export const PendienteDeAceptacion = {

    newAsociacion: async (asociacion) => {
        asociacion.estado = 'PendienteDeAceptacion';
        await asociacion.save();
        return asociacion;    
    },

    aceptar: async (asociacion) => {
        asociacion.estado = 'Aceptada';
        await asociacion.save();
        return asociacion;    
    },

    rechazada:  async (asociacion) => {
        asociacion.estado = 'Rechazada';

        await asociacion.save();
        return asociacion;    
    },

    cancelar: async (asociacion) => {
        asociacion.estado = 'Cancelada';
        await asociacion.save();
        return asociacion;
    },
};
  