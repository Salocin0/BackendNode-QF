import { sendNotificacionesMobile } from "../../dist/util/NotificacionesMobile.js";
import { userController } from "../controllers/users.controller.js";
import { sendNotificacionesWeb } from "../util/Notificaciones.js";
import { asociacionService } from "./asociacion.service.js";
import { productorService } from "./productor.service.js";
import { puestoService } from "./puesto.service.js";
import { getChatResponse } from "../util/chatbot.js";

class ChatbotService {
    async enviarChatbotTexto(userMessage) {
        
        const chat_response = await getChatResponse(userMessage)
        
        return {
            "user_message": userMessage,
            "chat_response": chat_response
        }
    }
}

export const chatbotService = new ChatbotService();
