export const Creado = {
    crearPuesto: async (puesto) => {
        puesto.estado = 'Creado';
        await puesto.save();
        return puesto;    
    },
  
    validar: async (puesto) => {
        puesto.estado = 'Habilitado';
        await puesto.save();
        return puesto;        
    },
  
    iniciarServicio: async (puesto) => {
        throw new Error('No se puede Iniciar el Servicio sin estar habilitado');
    },
  
    finalizarServicio: async (puesto) => {
        throw new Error('No se puede Finalizar el Servicio sin estar habilitado');

    },
  
    deshabilitar: async (puesto) => {
        puesto.estado = 'Deshabilitado';
        await puesto.save();
        return puesto;
    },
  
    habilitar: async (puesto) => {
        throw new Error('No se puede Habilitar el Servicio sin estar validado');
    },
  };
  