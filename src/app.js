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
import { createHashPW } from './util/bcrypt.js';
import { withDbRetry } from './util/dbRetry.js';
import { Usuario } from './DAO/models/users.model.js';
import session from 'express-session';
dotenv.config();
//definicion de server de express
const app = express();
const port = 8000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS — PRIMERO, antes que todo lo demás
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'consumidorid', 'ConsumidorId', 'puestoid', 'puestoId'],
    credentials: true,
  })
);

//Limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(compression({ brotli: { enable: true, zlib: {} } }));
//configuracion de sesiones
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

// Endpoint protegido para resetear la base de datos y volver a sembrar datos
// Requiere enviar { key: process.env.DB_RESET_KEY } en el body (POST)
app.post('/admin/reset-db', async (req, res) => {
  try {
    const providedKey = req.body?.key || req.headers['x-reset-key'];
    const secretKey = process.env.DB_RESET_KEY || 'dev-reset-key';
    if (providedKey !== secretKey) {
      return res.status(403).json({ status: 'error', msg: 'Invalid reset key' });
    }

    console.log('Iniciando reset de base de datos (force sync)...');
    // Forzar recreación de tablas
    await sequelize.sync({ force: true });

    // Ejecutar inserts desde Datos_DB.sql
    await DatosIniciales();

    // Ejecutar faker para generar datos adicionales
    await generateAllData();

    // Atualizar todas las contraseñas de usuarios a '123123123' (encriptada)
    const hashed = createHashPW('123123123');
    await Usuario.update({ contraseña: hashed }, { where: {} });

    console.log('Reset y seed completados.');
    return res.status(200).json({ status: 'success', msg: 'Database reset and seeded' });
  } catch (error) {
    console.error('Error en reset DB:', error);
    return res.status(500).json({ status: 'error', msg: 'Error resetting database', error: error.message });
  }
});

async function connectDB() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProd = nodeEnv === 'production' || nodeEnv === 'prod';

    await withDbRetry('autenticar conexión inicial', async () => {
      await sequelize.authenticate();
    });

    // Asegurarnos de eliminar vistas dependientes antes de intentar modificar esquemas
    // Esto evita errores en Postgres cuando una vista depende de columnas que Sequelize intentará alterar.
    try {
      await dropViewIfExists('chatbotdata');
    } catch (err) {
      console.warn('No se pudo eliminar la vista chatbotdata (continuando):', err.message || err);
    }

    // En Postgres puede haber múltiples vistas creadas por el SQL de seed; eliminarlas todas
    // para evitar errores al cambiar el esquema de tablas que las vistas referencian.
    try {
      const dialect = sequelize.getDialect ? sequelize.getDialect() : (sequelize.options && sequelize.options.dialect) || 'postgres';
      if (dialect === 'postgres') {
        const views = await withDbRetry('consultar vistas de schema public', async () =>
          sequelize.query(
            "SELECT table_schema, table_name FROM information_schema.views WHERE table_schema = 'public';",
            { type: sequelize.QueryTypes.SELECT }
          )
        );
        for (const v of views) {
          const name = v.table_name;
          try {
            await withDbRetry(`eliminar vista ${name}`, async () => {
              await sequelize.query(`DROP VIEW IF EXISTS \"${name}\" CASCADE;`);
            });
            console.log('Vista eliminada:', name);
          } catch (err) {
            console.warn('No se pudo eliminar la vista', name, err.message || err);
          }
        }
      }
    } catch (err) {
      console.warn('Error al intentar eliminar vistas del schema public (continuando):', err.message || err);
    }

    if (!isProd) {
      // Modo desarrollo: permitir drop, sync con force y seed de datos
      await withDbRetry('sincronizar modelos', async () => {
        await sequelize.sync({ force: process.env.DB_FORCE === 'true' });
      }); // false no modifica la base de datos
      if (process.env.DB_FORCE === 'true') {
        await DatosIniciales();
      }
      await generateAllData(); // Solo en desarrollo
    } else {
      // Modo producción: no borrar ni preinicializar datos. Sin force.
      await withDbRetry('sincronizar modelos en producción', async () => {
        await sequelize.sync({ force: false });
      });
      console.log('Modo producción detectado: no se preinicializan datos ni se borra la base de datos.');
    }

    // Ejecutar procesos automáticos en cualquier entorno
    if (process.env.NODE_ENV !== 'test') {
      procesosAutomaticos();
    }
    return true;
    
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
}

async function connectDbInBackground() {
  const retryDelayMs = Number(process.env.DB_BOOT_RETRY_DELAY_MS || 5000);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (true) {
    try {
      await connectDB();
      console.log('DB conectada e inicializada correctamente.');
      return;
    } catch (error) {
      console.error(
        `No se pudo inicializar la DB al arrancar. Reintentando en ${retryDelayMs}ms...`,
        error?.message || error
      );
      await wait(retryDelayMs);
    }
  }
}

export async function dropViewIfExists(viewName) {
  try {
    await withDbRetry(`eliminar vista ${viewName}`, async () => {
      await sequelize.query(`DROP VIEW IF EXISTS ${viewName} CASCADE;`);
    });
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
    await withDbRetry('ejecutar Datos_DB.sql', async () => {
      await sequelize.query(sql);
    });
    console.log('Datos iniciales cargados exitosamente.'); 
  } catch (error) {
    console.error('Error al setear los datos iniciales', error);
  }
}

// Iniciar servidor solo cuando la DB esté lista para evitar errores de conexión en requests tempranos.
async function bootstrap() {
  app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
  });

  // Mantener API arriba incluso si la DB está temporalmente caída.
  connectDbInBackground().catch((error) => {
    console.error('Error inesperado en inicialización de DB en background:', error?.message || error);
  });
}

//conectar a la base de datos y luego iniciar API
bootstrap();

// Middleware global de error: captura cualquier error no manejado
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);
  
  return res.status(err.status || 500).json({
    status: 'error',
    msg: err.message || 'Error interno del servidor',
    data: {},
  });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  return res.status(404).json({
    status: 'error',
    msg: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
  });
});

// Endpoint público (o usado localmente) para resetear la DB según Datos_DB.sql
// Lee el archivo SQL, elimina los datos de las tablas afectadas y vuelve a insertar.
app.get('/resetear/db', async (req, res) => {
  try {
    const sqlFilePath = path.resolve(__dirname, '../Datos_DB.sql');
    console.log('Reset DB: leyendo archivo SQL en', sqlFilePath);
    const sql = readFileSync(sqlFilePath, 'utf-8');

    // Extraer nombres de tablas desde los INSERT INTO del archivo
    const insertRegex = /INSERT\s+INTO\s+([^\s(]+)/gi;
    const tablesSet = new Set();
    let match;
    while ((match = insertRegex.exec(sql)) !== null) {
      let raw = match[1];
      // quitar schema si existe (public.eventos -> eventos)
      if (raw.includes('.')) raw = raw.split('.').pop();
      // quitar comillas
      raw = raw.replace(/"/g, '').replace(/'/g, '');
      // normalizar
      tablesSet.add(raw);
    }

    const tables = Array.from(tablesSet);
    console.log('Reset DB: tablas encontradas en SQL:', tables);

    const dialect = sequelize.getDialect ? sequelize.getDialect() : (sequelize.options && sequelize.options.dialect) || 'postgres';

    // Borrar datos respetando dialecto
    if (tables.length > 0) {
      if (dialect === 'postgres') {
        const list = tables.map(t => `"${t}"`).join(', ');
        await sequelize.query(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
      } else if (dialect === 'sqlite') {
        await sequelize.query('PRAGMA foreign_keys = OFF;');
        for (const t of tables) {
          await sequelize.query(`DELETE FROM "${t}";`);
          await sequelize.query(`DELETE FROM sqlite_sequence WHERE name='${t}';`).catch(() => {});
        }
        await sequelize.query('PRAGMA foreign_keys = ON;');
      } else {
        // MySQL/MariaDB
        if (dialect === 'mysql' || dialect === 'mariadb') {
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
          for (const t of tables) {
            await sequelize.query(`TRUNCATE TABLE \`${t}\`;`);
          }
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        } else {
          // Fallback: intentar DELETE simple
          for (const t of tables) {
            await sequelize.query(`DELETE FROM "${t}";`);
          }
        }
      }
    }

    // Ejecutar el archivo SQL para reinsertar los datos
    await withDbRetry('reinsertar datos desde SQL', async () => {
      await sequelize.query(sql, { raw: true });
    });

    // Después de ejecutar el SQL de seed, eliminar vistas que el SQL pueda haber creado
    try {
      const dialect = sequelize.getDialect ? sequelize.getDialect() : (sequelize.options && sequelize.options.dialect) || 'postgres';
      if (dialect === 'postgres') {
        const views = await withDbRetry('consultar vistas post-seed', async () =>
          sequelize.query(
            "SELECT table_schema, table_name FROM information_schema.views WHERE table_schema = 'public';",
            { type: sequelize.QueryTypes.SELECT }
          )
        );
        for (const v of views) {
          const name = v.table_name;
          try {
            await withDbRetry(`eliminar vista post-seed ${name}`, async () => {
              await sequelize.query(`DROP VIEW IF EXISTS \"${name}\" CASCADE;`);
            });
            console.log('Vista eliminada post-seed:', name);
          } catch (err) {
            console.warn('No se pudo eliminar la vista post-seed', name, err.message || err);
          }
        }
      }
    } catch (err) {
      console.warn('Error al intentar eliminar vistas post-seed (continuando):', err.message || err);
    }

    console.log('Reset DB completado.');
    return res.status(200).json({ status: 'success', msg: 'Database reset and seeded from Datos_DB.sql', tables });
  } catch (error) {
    console.error('Error al resetear DB:', error);
    return res.status(500).json({ status: 'error', msg: 'Error resetting DB', error: error.message });
  }
});