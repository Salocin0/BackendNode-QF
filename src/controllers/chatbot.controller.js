import { chatbotService } from '../services/chatbot.service.js';
import { normalizeChatInput } from '../util/chatbotInput.js';

// Shown as-is by the chat clients, so it must be user-facing Spanish.
const MENSAJE_ERROR_CHATBOT = 'No pude responder en este momento. Intentá de nuevo en unos minutos.';


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

      const text_response = await chatbotService.enviarChatbotTexto(message, req.body?.historial);
      if (text_response) {
        return res.status(200).json({
          status: 'Activo',
          msg: 'Texto Recibido',
          data: text_response,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: MENSAJE_ERROR_CHATBOT,
          data: {},
        });
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        status: 'error',
        msg: MENSAJE_ERROR_CHATBOT,
        data: {},
      });
    }
  }
  // Streams the answer as plain text so the chat can render it while it is written.
  // Errors before the first fragment still answer with the usual JSON error.
  async streamChatbotText(req, res) {
    const message = normalizeChatInput(req.body?.userMessage);
    if (!message) {
      return res.status(400).json({ status: 'Error', msg: 'Escribí una consulta para poder ayudarte.', data: {} });
    }

    const controller = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) controller.abort();
    });

    let started = false;
    const write = (piece) => {
      if (!started) {
        started = true;
        res.status(200).set({
          'Content-Type': 'text/plain; charset=utf-8',
          // no-transform keeps compression() from buffering the stream.
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        });
        res.flushHeaders?.();
      }
      res.write(piece);
      res.flush?.();
    };

    try {
      await chatbotService.streamChatbotTexto(message, write, controller.signal, req.body?.historial);
      if (!started) write('');
      res.end();
    } catch (e) {
      if (controller.signal.aborted) return;
      console.log(e);
      if (!started) {
        return res.status(500).json({ status: 'error', msg: MENSAJE_ERROR_CHATBOT, data: {} });
      }
      res.end('\n\nNo pude terminar la respuesta. Intentá de nuevo en unos minutos.');
    }
  }
}

export const chatbotController = new ChatbotController();

