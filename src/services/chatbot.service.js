import { sendNotificacionesMobile } from "../../dist/util/NotificacionesMobile.js";
import { userController } from "../controllers/users.controller.js";
import { sendNotificacionesWeb } from "../util/Notificaciones.js";
import { asociacionService } from "./asociacion.service.js";
import { productorService } from "./productor.service.js";
import { puestoService } from "./puesto.service.js";
//import { pregunta, consola } from "../util/chatbot.js";

class ChatbotService {
    async enviarChatbotTexto(user_message) {

        
        return {
            "user_message": user_message,
            chat_response: ' + respuesta del chat'
        }
    }
}

export const chatbotService = new ChatbotService();
