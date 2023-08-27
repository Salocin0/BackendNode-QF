import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import { __dirname } from './dirname.js';
import { RouterUser } from './routes/user.router.js';
import { RouterLogin } from './routes/login.router.js';
import { RouterConsumidor } from './routes/consumidor.router.js';
import { sequelize } from './util/connections.js';
import cors from 'cors';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { RouterProductor } from './routes/productor.router.js';
import { RouterEncargado } from './routes/encargado.router.js';
import { initPassport } from './config/passport.config.js';
import passport from 'passport';
import compression from 'express-compression';
import { RouterPuesto } from './routes/puesto.router.js';
import { RouterRepartidor } from './routes/repartidor.router.js';
import SequelizeStoreInit from 'connect-session-sequelize';

const app = express();
const port = 8000;

const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
});

// Middleware para permitir CORS
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(compression({ brotli: { enable: true, zlib: {} } }));

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
app.use('/puesto', RouterPuesto);
app.use('/repartidor', RouterRepartidor);



// Sincronizar la base de datos y luego iniciar el servidor
async function connectDB() {
  await sequelize.sync({ force: false });
  app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
  });
}

connectDB();

