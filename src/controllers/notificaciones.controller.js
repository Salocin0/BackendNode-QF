import { notificacionesService } from '../services/notificaciones.service.js';

class NotificacionController {
  enviarNotificacion = async (req, res) => {
    console.log('Recibí algo');
    try {
      const response = notificacionesService.enviarNotificacionesAPuesto(1, 'prueba', 'pru');
      res.status(200).json({ mensaje: 'Notificación enviada correctamente.', response });
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      res.status(500).json({ error: 'Error al enviar la notificación.' });
    }
  };

  getNotificaciones = async (req, res) => {
    try {
      const consumidorId = req.headers['consumidorid'];
      const notificaciones = await notificacionesService.getNotificaciones(consumidorId);
      res.status(200).json({ mensaje: 'Notificaciones obtenidas correctamente.', notificaciones });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error al obtener las notificaciones.' });
    }
  };

  CambiarNotificacionAVista = async (req, res) => {
    try {
      const notificacionId = req.params.id;
      const response = await notificacionesService.CambiarNotificacionAVista(notificacionId);
      res.status(200).json({ mensaje: 'Notificación marcada como vista.', response });
    } catch (error) {
      res.status(500).json({ error: 'Error al marcar la notificación como vista.' });
    }
  };
}

export const notificacionController = new NotificacionController();
