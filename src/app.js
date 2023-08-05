import cookieParser from 'cookie-parser';
import express from 'express';
import { __dirname } from './dirname.js';
import { RouterUser } from './routes/user.router.js';
import { RouterLogin } from './routes/login.router.js';
import { RouterConsumidor } from './routes/consumidor.router.js';
import { sequelize } from './util/connections.js';
import cors from 'cors';

import { RouterProductor } from './routes/Productor.router.js';
import { RouterEncargado } from './routes/encargado.router.js';

const app = express();
const port = 8000;

async function connectDB() {
  await sequelize.sync({ force: false });
  app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
  });
}

connectDB();

// Middleware para permitir CORS
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// URLs
app.use(express.static(__dirname + '/public'));
app.use('/user', RouterUser);
app.use('/consumidor', RouterConsumidor);
app.use('/login', RouterLogin);
app.use('/encargado', RouterEncargado);
app.use('/productor', RouterProductor);
