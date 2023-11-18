export const aceptada = {

    newAsociacion: async (asociacion) => {
        throw new Error('Error en el estado de la asociacion');

    },

    aceptar: async (asociacion) => {
        throw new Error('Error en el estado de la asociacion');
    },
    rechazada: async (asociacion) => {
        throw new Error('Error en el estado de la asociacion');
    },
    cancelada: async (asociacion) => { //Cambiar o quitar
        asociacion.estado = 'Cancelada';
        await asociacion.save();
        return asociacion;    
    },
};
  