export const Inactivo = {
    crearPuesto: async (puesto) => {
        throw new Error('El puesto ya ha sido creado');
    },
  
    validar: async (puesto) => {
        throw new Error('El puesto ya ha sido validado');

    },
  
    iniciarServicio: async (puesto) => {
        evento.estado = 'Activo';
        await evento.save();
        return evento;
    },
  
    finalizarServicio: async (puesto) => {
        throw new Error('No se puede finalizar el servicio');
    },
  
    deshabilitar: async (puesto) => {
        evento.estado = 'Deshabilitado';
        await evento.save();
        return evento;
    },
  
    habilitar: async (puesto) => {
        throw new Error('No se puede habilitar el puesto');
    },
  };
  