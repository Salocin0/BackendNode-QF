import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { SqlDatabase } from "langchain/sql_db";

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  schema: process.env.DB_SCHEMA,
  dialect: process.env.DB_DIALECT || 'postgres',
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true',
  },
});

async function getDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');
    
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: sequelize, // Usa Sequelize como fuente de datos
    });

    return db;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    throw error;
  }
}

export async function getChatResponse(userMessage) {
  try {
    const db = await getDatabaseConnection();

    // Obtén el esquema de la base de datos
    const schemaInfo = await db.getTableInfo();
    console.log('Información del esquema:', schemaInfo);

    // Ejecuta una consulta en la base de datos
    const result = await db.run("SELECT * FROM public.chatbotData;");
    
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

    const response = await chain.call({ input: userMessage, chatbotData: result });
    return response.text;
  } catch (error) {
    console.error('Error al obtener la respuesta de OpenAI:', error);
    throw error;
  }
}
