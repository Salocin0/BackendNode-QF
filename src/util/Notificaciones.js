import admin from 'firebase-admin'; // Ajusta la importación según tu configuración de Firebase Admin
import serviceAccount from "../../serviceAccountKey.json" assert { type: "json" };
// Inicializar Firebase Admin SDK con tu configuración
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function sendNotificaciones(token, titulo, descripcion) {
  try {
    // Objeto de mensaje común para ambas plataformas
    const message = {
      sound: 'default',
      title: titulo,
      body: descripcion,
    };

    // Verificar si es un token de Expo válido (si lo necesitas en el futuro, puedes incluir la lógica de Expo aquí)
    // if (Expo.isExpoPushToken(token)) {
    //   message.to = token;
    //   let chunks = expo.chunkPushNotifications([message]);
    //   let receipts = await expo.sendPushNotificationsAsync(chunks);
    //   console.log('Notificaciones enviadas a Expo:', receipts);
    // } else {
    // Si no es un token de Expo, enviar la notificación a Firebase Messaging
    const firebaseMessage = {
      notification: {
        title: titulo,
        body: descripcion,
      },
      token: token,
    };
    const response = await admin.messaging().send(firebaseMessage);
    console.log('Notificación enviada a Firebase Messaging:', response);
    // }

    return true;
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    return false;
  }
}
