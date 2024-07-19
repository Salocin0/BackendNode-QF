// notificaciones.controller.js

import { notificacionesService } from '../services/notificaciones.service.js';
import { sendNotificacionesWeb } from '../util/Notificaciones.js';

class NotificacionController {
  enviarNotificacion = async (req, res) => {
    console.log("Recibí algo");
    try {
      const response = notificacionesService.enviarNotificacionesAPuesto(1,"prueba","pru")
      res.status(200).json({ mensaje: 'Notificación enviada correctamente.', response });
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      res.status(500).json({ error: 'Error al enviar la notificación.' });
    }
  };
}

export const notificacionController = new NotificacionController();
