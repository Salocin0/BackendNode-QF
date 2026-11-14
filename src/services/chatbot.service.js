import { getChatResponse, streamChatResponse } from "../util/chatbot.js";

class ChatbotService {
    async enviarChatbotTexto(userMessage) {
        
        const chat_response = await getChatResponse(userMessage)
        
        return {
            "user_message": userMessage,
            "chat_response": chat_response
        }
    }

    async streamChatbotTexto(userMessage, onPiece, signal) {
        await streamChatResponse(userMessage, onPiece, signal);
    }
}

export const chatbotService = new ChatbotService();

