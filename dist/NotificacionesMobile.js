"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificacionesMobile = sendNotificacionesMobile;
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo();
async function sendNotificacionesMobile(token, titulo, descripcion) {
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
    }
    catch (error) {
        console.error('Error al enviar notificaciones:', error);
        return false;
    }
}
