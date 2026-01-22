import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false;
const connectionString = process.env.DB_URL;

const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: sslOption,
      },
    })
  : new Sequelize({
      database: process.env.DB_NAME ? String(process.env.DB_NAME) : undefined,
      username: process.env.DB_USER ? String(process.env.DB_USER) : undefined,
      password: process.env.DB_PASSWORD != null ? String(process.env.DB_PASSWORD) : undefined,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      host: process.env.DB_HOST ? String(process.env.DB_HOST) : undefined,
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: sslOption,
      },
    });

async function getChatResponse(userMessage) {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');


    // Refrescar la vista materializada
   //await sequelize.query("REFRESH MATERIALIZED VIEW public.chatbotData;");

    // Realizar consulta directa usando Sequelize
    const [results] = await sequelize.query("SELECT * FROM public.chatbotData;");
    


    const apiKey = process.env.CHATBOT_API_KEY;

    const openAIModel = new ChatOpenAI({
      apiKey: apiKey,
      modelName: 'gpt-3.5-turbo', // Puedes cambiar a 'gpt-4-turbo'
      temperature: 0,
      maxTokens: 150,
    });

    const template = new PromptTemplate({
      inputVariables: ['chatbotData', 'input'],
      template: `Olvida todas tus conversaciones pasadas. Ahora eres un asistente inteligente de una plataforma de eventos. Tienes acceso a la siguiente información sobre eventos y los carros de comida asociados a esos eventos: {chatbotData}. Tu tarea es responder con precisión y claridad a la siguiente pregunta de un usuario utilizando la información proporcionada:

                Pregunta del usuario: {input}

                Asegúrate de que tu respuesta sea con la información, respuesta CORTA y útil para el usuario. Si la información que se pide no está disponible, indícalo claramente y ofrece la alternativa de comunicarte con 'consultas@QF.com '.
                `,
    });

    const chain = new LLMChain({
      llm: openAIModel,
      prompt: template,
    });

    // Convertir los resultados en un formato legible
    const chatbotData = JSON.stringify(results);

    const response = await chain.call({ input: userMessage, chatbotData });
    return response.text;
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI:', error);
    throw error;
  }
}

export { getChatResponse };

