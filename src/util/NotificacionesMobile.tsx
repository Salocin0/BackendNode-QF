import Expo from 'expo-server-sdk';
const expo = new Expo();

export async function sendNotificacionesMobile(token: string, titulo: string, descripcion: string): Promise<boolean> {
  try {
    const messages = [
      {
        to: token,
        title: titulo,
        body: descripcion,
      },
    ];
    await expo.sendPushNotificationsAsync(messages);
    return true;
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    return false;
  }
}
