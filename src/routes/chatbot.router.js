import express from 'express';
import {chatbotController} from '../controllers/chatbot.controller.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const RouterChatbot = express.Router();

// The chatbot calls a paid LLM, so it is throttled per client IP.
// Defaults: 20 questions per minute, enough for a demo and cheap to abuse-proof.
const chatbotLimiter = createRateLimiter({
  windowMs: Number(process.env.CHATBOT_RATE_WINDOW_MS || 60_000),
  max: Number(process.env.CHATBOT_RATE_MAX || 20),
});

RouterChatbot.post('/', chatbotLimiter, chatbotController.createChatbotText);

export default RouterChatbot;
