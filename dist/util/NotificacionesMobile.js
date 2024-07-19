var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Expo from 'expo-server-sdk';
const expo = new Expo();
export function sendNotificacionesMobile(token, titulo, descripcion) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const messages = [
                {
                    to: token,
                    title: titulo,
                    body: descripcion,
                },
            ];
            yield expo.sendPushNotificationsAsync(messages);
            return true;
        }
        catch (error) {
            console.error('Error al enviar notificaciones:', error);
            return false;
        }
    });
}
