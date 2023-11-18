export const Deshabilitado = {
    crearPuesto: async (puesto) => {
        throw new Error('El puesto ya ha sido creado');
    },
  
    validar: async (puesto) => {
        throw new Error('El puesto ya ha sido validado ');
    },
  
    iniciarServicio: async (puesto) => {
        throw new Error('No se puede iniciar el servicio');
    },
  
    finalizarServicio: async (puesto) => {
        throw new Error('No se puede finalizar el servicio');

    },
  
    deshabilitar: async (puesto) => {
        puesto.estado = 'Creado';
        puesto.save();
        return puesto;
    },
  
    habilitar: async (puesto) => {
        puesto.estado = 'Creado';
        puesto.save();
        return puesto;    },
  };
  