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
import { RouterProductor } from './routes/productor.router.js';
import { RouterEncargado } from './routes/encargado.router.js';
import { initPassport } from './config/passport.config.js';
import passport from 'passport';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compression from 'express-compression';
import { RouterPuesto } from './routes/puesto.router.js';
import { RouterRepartidor } from './routes/repartidor.router.js';

const app = express();
const port = 8000;

async function connectDB() {
  await sequelize.sync({ force: false }); //ESTE !!!
  app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
  });
}

connectDB();

// Middleware para permitir CORS
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(compression({brotli:{enable:true,zlib:{}},}));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

//Passport

initPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(flash());

// URLs
app.use(express.static(__dirname + '/public'));
app.use('/user', RouterUser);
app.use('/consumidor', RouterConsumidor);
app.use('/login', RouterLogin);
app.use('/encargado', RouterEncargado);
app.use('/productor', RouterProductor);
app.use('/puesto', RouterPuesto);
app.use('/repartidor', RouterRepartidor);
