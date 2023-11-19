//prueba
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import SequelizeStoreInit from 'connect-session-sequelize';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import compression from 'express-compression';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import { initPassport } from './config/passport.config.js';
import { __dirname } from './dirname.js';
import { RouterAsociacion } from './routes/asociacion.router.js';
import { RouterCarrito } from './routes/carrito.router.js';
import { RouterConsumidor } from './routes/consumidor.router.js';
import { RouterEncargado } from './routes/encargado.router.js';
import { RouterEvento } from './routes/evento.router.js';
import { RouterLogin } from './routes/login.router.js';
import { RouterPedido } from './routes/pedido.router.js';
import { RouterProducto } from './routes/producto.router.js';
import { RouterProductor } from './routes/productor.router.js';
import { RouterPuesto } from './routes/puesto.router.js';
import { RouterRepartidor } from './routes/repartidor.router.js';
import { RouterRestriccion } from './routes/restriccion.router.js';
import { RouterUser } from './routes/user.router.js';
import { sequelize } from './util/connections.js';
import { procesosAutomaticos } from './util/procesosAutomaticos.js';
//definicion de server de express
const app = express();
const port = 8000;
//inicializacion de la base de datos
const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
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
//TODO MOVER A USER Y SEPARAR EN CAPAS
app.post('/user/session', async (req, res) => {
  sessionStore.get(req.body.sessionID, async (error, sessionData) => {
    if (error) {
      console.error('Error al obtener la sesión:', error);
      return res.status(500).json({
        status: 'error',
        msg: 'Error al obtener la sesión',
        data: null,
      });
    }
    if (sessionData && sessionData.user) {
      return res.status(200).json({
        status: 'success',
        msg: 'Sesión de usuario encontrada',
        data: sessionData.user,
      });
    } else {
      return res.status(400).json({
        status: 'error',
        msg: 'Sesión de usuario no encontrada',
        data: null,
      });
    }
  });
});
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
app.use('/carrito', RouterCarrito)
app.use('/pedido', RouterPedido)


// Sincronizar la base de datos y luego iniciar el servidor
async function connectDB() {
  await sequelize.sync({ force: false }); //FALSE NO CAMBIA
  app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
  });
}
//conectar a la base de datos
connectDB();

//ejecutar procesos automaticos
procesosAutomaticos();