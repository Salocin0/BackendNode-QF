export const Aceptada = {

    newAsociacion: async (asociacion) => {
        throw new Error('Error en el estado de la asociacion');

    },

    aceptar: async (asociacion) => {
        throw new Error('Error en el estado de la asociacion');
    },
    rechazada: async (asociacion) => {
        throw new Error('Error en el estado de la asociacion');
    },
    cancelar: async (asociacion) => { //Cambiar o quitar
        asociacion.estado = 'PendienteDeAceptacion';
        await asociacion.save();
        return asociacion;    
    },
};
  