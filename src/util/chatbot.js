// Importar las bibliotecas necesarias
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
