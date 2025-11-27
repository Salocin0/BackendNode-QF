import admin from 'firebase-admin'; // Ajusta la importación según tu configuración de Firebase Admin
import getServiceAccount from './serviceAccountBuilder.js';

// Inicializar Firebase Admin SDK bajo demanda (cuando se necesite)
function ensureFirebaseInitialized() {
  if (!admin.apps || admin.apps.length === 0) {
    const serviceAccount = getServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export async function sendNotificacionesWeb(token, titulo, descripcion) {
  try {
    ensureFirebaseInitialized();
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