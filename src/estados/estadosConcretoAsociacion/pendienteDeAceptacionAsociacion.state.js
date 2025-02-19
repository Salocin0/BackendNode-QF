import { asociacionService } from "../../services/asociacion.service.js";


export const PendienteDeAceptacion = {
  newAsociacion: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  aceptar: async (asociacion,asociacionId) => {
    asociacion.estado = 'Aceptada';
    await asociacion.save();
    await asociacionService.sendNotificacionesAceptarAsociacion(asociacion);
    return asociacion;
  },

  rechazada: async (asociacion,asociacionId) => {
    asociacion.estado = 'Rechazada';
    await asociacionService.sendNotificacionesRechazarAsociacion(asociacion);

    await asociacion.save();
    return asociacion;
  },

  cancelar: async (asociacion) => {
    asociacion.estado = 'Cancelada';
    await asociacion.save();
    return asociacion;
  },

  confirmada: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  cerrada: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },
};
