//prueba
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import SequelizeStoreInit from 'connect-session-sequelize';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import compression from 'express-compression';
import session from 'express-session';
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
import { sequelize } from './util/connections.js';
import { procesosAutomaticos } from './util/procesosAutomaticos.js';
import { generateAllData } from './util/faker.js';
/*import {pregunta} from './util/chatbot.js'*/
/*import  RouterChatbot  from './routes/chatbot.router.js'*/

dotenv.config();
//definicion de server de express
const app = express();
const port = 8000;
const stripe = Stripe('sk_test_51PnpcMRoRlWr6LoNVHnAJMDXVOFLMlAAeTxMZUvUuWmPt4qMChWK3SYn8ZPcwE8cwg5dsEmkEIPWjlFBRzBOOpco00YLHUKBoL');
//inicializacion de la base de datos
const SequelizeStore = SequelizeStoreInit(session.Store);
export const sessionStore = new SequelizeStore({
  db: sequelize,
});
//Limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression({ brotli: { enable: true, zlib: {} } }));
//configuracion de sesiones
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
//Passport
initPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(flash());
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
app.use('/notificaciones4', RouterNotificacion);
app.use('/payment-sheet', PaymentRouter);
//app.use('/chatbot', RouterChatbot)


async function connectDB() {
  try {
    await sequelize.sync({ force: false }); // false no modifica la base de datos
    //DatosIniciales() //COMENTAR SI FORCE SE COLOCA EN FALSE
    //generateAllData() //COMENTAR SI FORCE SE COLOCA EN FALSE
    procesosAutomaticos();
    app.listen(port, () => {
      console.log('Servidor escuchando en el puerto ' + port);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
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


