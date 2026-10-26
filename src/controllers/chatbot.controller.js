import { chatbotService } from '../services/chatbot.service.js';
import { normalizeChatInput } from '../util/chatbotInput.js';


class ChatbotController {
  async createChatbotText(req, res) {
    try {
      const message = normalizeChatInput(req.body?.userMessage);
      if (!message) {
        return res.status(400).json({
          status: 'Error',
          msg: 'Escribí una consulta para poder ayudarte.',
          data: {},
        });
      }

      const text_response = await chatbotService.enviarChatbotTexto(message);
      if (text_response) {
        return res.status(200).json({
          status: 'Activo',
          msg: 'Texto Recibido',
          data: text_response,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'text not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }
}

export const chatbotController = new ChatbotController();

