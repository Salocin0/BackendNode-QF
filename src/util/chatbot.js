/*// Importar las bibliotecas necesarias
import { ChatOpenAI } from '@langchain/openai';
import { RunnablePassthrough } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
//import  Client  from 'pg';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// Configurar variables de entorno
dotenv.config();


// Configurar conexión a la base de datos PostgreSQL
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'DB_QF',
    password: '123',
    port: 5432,
});

client.connect();


const query = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public';
    `;

async function getSchema() {    
    const res = await client.query(query);
    return res.rows;
}

const schema = getSchema();

// Configurar la API de OpenAI
const llm = new ChatOpenAI({
    temperature: 0,
    model: 'gpt-3.5-turbo',
    verbose: true,
    apiKey: process.env.CHATBOT_API_KEY,
});



// Función para ejecutar una consulta SQL


const question = ''
const response = ''

// Configurar el template para el prompt de LangChain
const template = `
Generame de forma experta (ya que sos un experto en PostgreSQL y búsquedas), una respuesta en lenguaje natural basada en la consulta SQL y los resultados obtenidos.

Basado en el esquema de la base de datos abajo:
${schema}

Pregunta del usuario: ${question}
Consulta SQL: ${query}
Respuesta SQL: ${response}

Respuesta concisa en lenguaje natural para el usuario de una aplicación (mostrar solo el resultado):
${response}
`;

const promptResponse = ChatPromptTemplate.fromTemplate(template);

// Crear la cadena completa con LangChain
async function fullChain(userInput) {
    const schema = await getSchema();
    const sqlChain = 'SELECT * FROM eventos LIMIT 10'; // Ajustar según la lógica que necesites
    const response = await client.query(sqlChain);

    // Crear el objeto chain manualmente sin usar .assign()
    const chain = new RunnablePassthrough()
        .pipe(async (vars) => {
            // Genera el esquema y ejecuta la consulta SQL
            const query = vars.query;
            const result = await client.query(query);
            return {
                ...vars,
                schema: schema,
                response: result.rows,
            };
        })
        .pipe(promptResponse)
        .pipe(llm);

    // Ejecutar la cadena con el input del usuario
    const chatResponse = await chain.invoke({
        query: sqlChain,
        question: userInput
    });

    return chatResponse;
}


// Ejemplo de uso
export const pregunta = (async () => {
    const user_input = 'cuales son los eventos disponibles?';
    const response = await fullChain(user_input);
    console.log(response);
});

export const consola = (async () => {
    console.log('bandera');
});
*/


//------------------------------------------------------------------------------------------------------
// chatbot.js

import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";

import dotenv from 'dotenv';

// Cargar el archivo .env
dotenv.config();

// Usar el archivo de variables de entorno para obtener la API key
const apiKey = process.env.CHATBOT_API_KEY;

//const userMessage = 'Capital de china?'

// definir la db a utilizar
const datasource = new DataSource({
    type: "postgres",              // Tipo de base de datos
    host: process.env.DB_HOST,             // Host donde se encuentra tu base de datos
    port: process.env.DB_PORT,                    // Puerto de PostgreSQL (5432 por defecto)
    username: process.env.DB_USER,        // Tu nombre de usuario de PostgreSQL
    password: process.env.DB_PASSWORD,     // Tu contraseña de PostgreSQL
    database: process.env.DB_NAME, // Nombre de la base de datos
    //synchronize: true,             // Sincroniza la base de datos con tu esquema (ten cuidado con esto en producción)
    //logging: true,                 // Habilita el logging (opcional)
  });


  //conectar con la db
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });

  // Info del esquema
  const schemaInfo = await db.getTableInfo();
  
  // Ejemplo de query
  //const result = await db.run("SELECT COUNT(*) AS total FROM consumidores;");

  const result = await db.run("SELECT * FROM public.chatbotData;");


// Configuración del modelo OpenAI
const openAIModel = new ChatOpenAI({
    apiKey: apiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0,  // Sin creatividad
    maxTokens: 150,  // Puedes ajustar según tus necesidades
});

// Configuración del template para las preguntas
const template = new PromptTemplate({
    inputVariables: ['chatbotData','input'],
    template: `Eres un asistente inteligente de una plataforma de eventos. Tienes acceso a la siguiente información sobre eventos y los carros de comida asociados a esos eventos: {chatbotData}. Tu tarea es responder con precisión y claridad a la siguiente pregunta de un usuario utilizando la información proporcionada:

                Pregunta del usuario: {input}

                Asegúrate de que tu respuesta sea compacta, fácil de entender, y útil para el usuario. Si la información que se pide no está disponible, indícalo claramente y ofrece la alternativa de comunicarte con 'consultas@QF.com ' .
                ` 
});

// Configuración de LLMChain, asegurando que el template esté correctamente definido
const chain = new LLMChain({
    llm: openAIModel,
    prompt: template,  // Asegúrate de usar 'prompt' en lugar de 'promptTemplate'
});

export async function getChatResponse(userMessage) {
    try {
        const response = await chain.call({ input: userMessage , chatbotData: result});
        return response.text;
    } catch (error) {
        console.error('Error al obtener la respuesta de OpenAI:', error);
        throw error;
    }
}

//getChatResponse(userMessage)

//const chat_response = await getChatResponse(userMessage)

//console.log(chat_response)