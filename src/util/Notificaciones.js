import Expo from 'expo-server-sdk';
import { userService } from '../services/users.service.js';

export async function sendNotificaciones(token, titulo, descripcion) {
  try {
    //buscar el usuario
    //const user = userService.getOne(UsuarioID)
    //const token = user.tokenMobile
    const resultadoNotifi = sendExpo(token,titulo,descripcion,null) 
    console.log(resultadoNotifi)
    //sacar el token de web
    //mandar notificacion web
    //sacar el token mobile
    //mandar notificacion mobile
    return true;
  } catch (error) {
    return false;
  }
}

async function sendExpo(Token, titulo, descripcion, data) {
  try {
    let expo = new Expo();

    const messages = {
      to: Token,
      sound: 'default',
      title: titulo,
      body: descripcion,
      data: data,
    };

    let chunks = expo.chunkPushNotifications(messages);

    let receipts = await expo.sendPushNotificationsAsync(chunks);
    console.log(receipts);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function sendFirebase(Token, titulo, descripcion) {
  try {
    //intentar mandar la notificacion
    return true;
  } catch (error) {
    return false;
  }
}
