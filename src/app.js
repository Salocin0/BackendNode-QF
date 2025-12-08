//prueba
import bodyParser from 'body-parser';
import flash from 'connect-flash';

import cookieParser from 'cookie-parser';
import cors from 'cors';


import compression from 'express-compression';

import { readFileSync } from 'fs';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import Stripe from 'stripe';
import { initPassport } from './config/passport.config.js';
import { __dirname } from './dirname.js';
import { RouterProductor } from './routes/Productor.router.js';
import { RouterAsignaciones } from './routes/asignacion.router.js';
import { RouterAsociacion } from './routes/asociacion.router.js';
import { RouterCarrito } from './routes/carrito.router.js';
import { RouterConsumidor } from './routes/consumidor.router.js';
import { RouterEncargado } from './routes/encargado.router.js';
import { RouterEvento } from './routes/evento.router.js';
import { RouterLogin } from './routes/login.router.js';
import { RouterNotificacion } from './routes/notificacion.router.js';
import PaymentRouter from './routes/payment.router.js';
import { RouterPedido } from './routes/pedido.router.js';
import { RouterProducto } from './routes/producto.router.js';
import { RouterPuesto } from './routes/puesto.router.js';
import { RouterPuntoEncuentro } from './routes/puntoEncuentro.router.js';
import { RouterRepartidor } from './routes/repartidor.router.js';
import { RouterRestriccion } from './routes/restriccion.router.js';
import { RouterUser } from './routes/user.router.js';
import { RouterValoracion } from './routes/valoracion.router.js';
import { RouterEstadisticas } from './routes/estadisticas.router.js';
import  RouterChatbot  from './routes/chatbot.router.js'
import dotenv from 'dotenv';
import express from 'express';
import { sequelize } from './util/connections.js';
import SequelizeStoreInit from 'connect-session-sequelize';
import { procesosAutomaticos } from './util/procesosAutomaticos.js';
import { generateAllData } from './util/faker.js';
import { middlewareReactivarProcesos } from './middlewares/reactivarProcesos.js';
dotenv.config();
//definicion de server de express
const app = express();
const port = 8000;
const SequelizeStore = SequelizeStoreInit(session.Store);
export const sessionStore = new SequelizeStore({
  db: sequelize,
});
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
import session from 'express-session';

const stripe = Stripe('sk_test_51PnpcMRoRlWr6LoNVHnAJMDXVOFLMlAAeTxMZUvUuWmPt4qMChWK3SYn8ZPcwE8cwg5dsEmkEIPWjlFBRzBOOpco00YLHUKBoL');
//inicializacion de la base de datos

//Limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Middlewares
app.use(
  cors({
    origin: "*", // Permite cualquier origen
    methods: "*", // Permite todos los métodos
    allowedHeaders: "*", // Permite todos los headers
    credentials: true, // Permite credenciales
  })
);

// Manejo de solicitudes OPTIONS manualmente (100% abierto)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*"); // Permite todos los métodos
  res.header("Access-Control-Allow-Headers", "*"); // Permite todos los headers
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

// Fallback CORS middleware: asegura cabeceras en TODAS las respuestas (incluyendo errores)
// Esto protege contra proxies/hosting que puedan eliminar cabeceras en respuestas de error.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression({ brotli: { enable: true, zlib: {} } }));
//configuracion de sesiones

//Passport
initPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});
// parse application/json
app.use(bodyParser.json());
app.use(flash());

// Middleware global: reactivar procesos automáticos con cualquier petición
app.use(middlewareReactivarProcesos);

// URLs
app.use(express.static(__dirname + '/public'));

app.use('/user', RouterUser);
app.use('/consumidor', RouterConsumidor);
app.use('/login', RouterLogin);
app.use('/encargado', RouterEncargado);
app.use('/productor', RouterProductor);
app.use('/repartidor', RouterRepartidor);
app.use('/puesto', RouterPuesto);
app.use('/producto', RouterProducto);
app.use('/evento', RouterEvento);
app.use('/restriccion', RouterRestriccion);
app.use('/asociacion', RouterAsociacion);
app.use('/carrito', RouterCarrito);
app.use('/pedido', RouterPedido);
app.use('/valoracion', RouterValoracion);
app.use('/puntosEncuentro',RouterPuntoEncuentro);
app.use('/asignaciones',RouterAsignaciones);
app.use('/notificaciones', RouterNotificacion);
app.use('/payment-sheet', PaymentRouter);
app.use('/chatbot', RouterChatbot)
app.use('/estadisticas', RouterEstadisticas)

app.get("/info", (req, res) => {
  res.json({
    message: "Información del servidor",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Endpoint de salud: devuelve la fecha/hora actual (útil para checks de uptime)
app.get('/health', (req, res) => {
  const now = new Date();
  return res.status(200).json({
    status: 'ok',
    timestamp: now.getTime(),
    date: now.toISOString()
  });
});

async function connectDB() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProd = nodeEnv === 'production' || nodeEnv === 'prod';

    if (!isProd) {
      // Modo desarrollo: permitir drop, sync con force y seed de datos
      await dropViewIfExists('chatbotdata');
      await sequelize.sync({ force: process.env.DB_FORCE === 'true' }); // false no modifica la base de datos
      if (process.env.DB_FORCE === 'true') {
        await DatosIniciales();
      }
      await generateAllData(); // Solo en desarrollo
    } else {
      // Modo producción: no borrar ni preinicializar datos. Sin force.
      await sequelize.sync({ force: false });
      console.log('Modo producción detectado: no se preinicializan datos ni se borra la base de datos.');
    }

    // Ejecutar procesos automáticos en cualquier entorno
    procesosAutomaticos();
    
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
}

export async function dropViewIfExists(viewName) {
  try {
    await sequelize.query(`DROP VIEW IF EXISTS ${viewName} CASCADE;`);
    console.log(`Vista ${viewName} eliminada correctamente.`);
  } catch (error) {
    console.error(`Error al eliminar la vista ${viewName}:`, error);
  }
}

async function DatosIniciales() {
  try {
    const sqlFilePath = path.resolve(__dirname, '../Datos_DB.sql');
    console.log('Ruta al archivo SQL:', sqlFilePath);
    const sql = readFileSync(sqlFilePath, 'utf-8');
    await sequelize.query(sql);
    console.log('Datos iniciales cargados exitosamente.'); 
  } catch (error) {
    console.error('Error al setear los datos iniciales', error);
  }
}

//conectar a la base de datos
connectDB();
//ejecutar procesos automaticos



app.listen(port, () => {
  console.log('Servidor escuchando en el puerto ' + port);
});