import admin from "./firebase-admin";

export async function sendNotificacionesWeb(token, titulo, descripcion) {
  try {
    const message = {
      notification: {
        title: titulo,
        body: descripcion,
      },
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log("Notificación enviada a Firebase Messaging:", response);

    return true;
  } catch (error) {
    console.error("Error al enviar notificaciones:", error);
    return false;
  }
}
