import { getChatResponse, streamChatResponse } from "../util/chatbot.js";

class ChatbotService {
    async enviarChatbotTexto(userMessage, historial) {
        
        const chat_response = await getChatResponse(userMessage, historial)
        
        return {
            "user_message": userMessage,
            "chat_response": chat_response
        }
    }

    // historial: last messages sent by the chat client (validated in util/chatbotHistorial.js).
    async streamChatbotTexto(userMessage, onPiece, signal, historial) {
        await streamChatResponse(userMessage, onPiece, signal, historial);
    }
}

export const chatbotService = new ChatbotService();

