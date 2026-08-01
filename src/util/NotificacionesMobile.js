import { Expo } from 'expo-server-sdk';
import { Usuario } from '../DAO/models/users.model.js';

const expo = new Expo();

export async function sendNotificacionesMobile(token, titulo, descripcion, usuarioId = null, data = {}) {
  if (!Expo.isExpoPushToken(token)) {
    console.error('Push token de Expo inválido:', token);
    return false;
  }

  try {
    const messages = [
      {
        to: token,
        title: titulo,
        body: descripcion,
        data,
      },
    ];
    const tickets = await expo.sendPushNotificationsAsync(messages);
    const ticket = tickets[0];

    if (ticket.status === 'error') {
      console.error('Error al enviar notificación:', ticket.message);
      if (ticket.details?.error === 'DeviceNotRegistered' && usuarioId) {
        await Usuario.update({ tokenMobile: null }, { where: { id: usuarioId } });
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    return false;
  }
}
