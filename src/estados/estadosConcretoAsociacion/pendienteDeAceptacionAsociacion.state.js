import { asociacionService } from "../../services/asociacion.service.js";


export const PendienteDeAceptacion = {
  newAsociacion: async (asociacion) => {
    throw new Error('Error en el estado de la asociacion');
  },

  aceptar: async (asociacion,asociacionId) => {
    asociacion.estado = 'Aceptada';
    await asociacion.save();
    const asociacionNotificaciones = await asociacionService.sendNotificacionesWebAceptarAsociacionRepartido(asociacionId);
    return asociacion;
  },

  rechazada: async (asociacion,asociacionId) => {
    asociacion.estado = 'Rechazada';
    const asociacionNotificaciones = await asociacionService.sendNotificacionesWebRechazarAsociacionRepartido(asociacionId);

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
