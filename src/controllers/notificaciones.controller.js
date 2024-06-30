// notificaciones.controller.js

import { sendNotificaciones } from '../util/Notificaciones.js';

class NotificacionController {
  enviarNotificacion = async (req, res) => {
    console.log("Recibí algo");
    const { token, titulo, descripcion } = req.body;

    if (!token || !titulo || !descripcion) {
      return res.status(400).json({ error: 'Se requiere token, título y descripción.' });
    }

    try {
      const response = await sendNotificaciones(token, titulo, descripcion);
      res.status(200).json({ mensaje: 'Notificación enviada correctamente.', response });
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      res.status(500).json({ error: 'Error al enviar la notificación.' });
    }
  };
}

export const notificacionController = new NotificacionController();
