import admin from 'firebase-admin'; // Ajusta la importación según tu configuración de Firebase Admin
import serviceAccount from "../../serviceAccountKey.json" assert { type: "json" };
// Inicializar Firebase Admin SDK con tu configuración
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function sendNotificacionesWeb(token, titulo, descripcion) {
  try {
    const Message = {
      notification: {
        title: titulo,
        body: descripcion,
      },
      token: token,
    };
    const response = await admin.messaging().send(Message);
    console.log('Notificación enviada a Firebase Messaging:', response);

    return true;
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    return false;
  }
}