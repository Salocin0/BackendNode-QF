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
import { runSeedDemo } from './util/seedDemoData.js';
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
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, server-to-server, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('CORS not allowed'));
    },
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

// Página visual para disparar el seed de demo con un botón y ver el resumen
app.get('/seed', (req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>QuickFood - Seed Demo</title>
<style>
  body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #f0c040; max-width: 720px; margin: 40px auto; padding: 0 16px; }
  h1 { text-align: center; }
  button { background: #f0c040; color: #1a1a1a; border: none; padding: 14px 28px; font-size: 18px; font-weight: bold; border-radius: 8px; cursor: pointer; display: block; margin: 24px auto; }
  button:disabled { opacity: .5; cursor: wait; }
  pre { background: #111; color: #ddd; padding: 16px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; }
  .warn { color: #ff7043; text-align: center; }
</style>
</head>
<body>
<h1>🌱 Seed de datos de demo</h1>
<p class="warn">⚠️ Esto VACÍA todas las tablas y siembra el dataset de demo (evento, 3 puestos, historial de pedidos para estadísticas).</p>
<button id="btn" onclick="seed()">Resetear y sembrar datos de demo</button>
<pre id="out">Todavía no se ejecutó nada.</pre>
<script>
async function seed() {
  const btn = document.getElementById('btn');
  const out = document.getElementById('out');
  if (!confirm('¿Seguro? Se borran TODOS los datos actuales.')) return;
  btn.disabled = true;
  out.textContent = '⏳ Sembrando... (puede tardar un rato por el historial de pedidos)';
  try {
    const r = await fetch('/seed/demo');
    const data = await r.json();
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = '❌ Error: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}
</script>
</body>
</html>`);
});

// Endpoint de demo: vacía la DB y siembra el dataset de demo (4 roles, evento "fiesta del cuarteto", puesto, pedidos)
// Sin autenticación a propósito — uso interno para preparar demos, decisión del dueño del proyecto.
app.get('/seed/demo', async (req, res) => {
  try {
    console.log('🔄 /seed/demo: iniciando reseed de datos de demo...');
    const resumen = await runSeedDemo();
    console.log('✅ /seed/demo: reseed completado.');
    return res.status(200).json({ status: 'success', msg: 'Demo data seeded', ...resumen });
  } catch (error) {
    console.error('❌ /seed/demo: error al sembrar datos de demo:', error);
    return res.status(500).json({ status: 'error', msg: 'Error seeding demo data', error: error.message });
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
        await generateAllData();
      }
    } else {
      // Modo producción: no borrar ni preinicializar datos. Sin force.
      await withDbRetry('sincronizar modelos en producción', async () => {
        await sequelize.sync({ force: false });
      });
      console.log('Modo producción detectado: no se preinicializan datos ni se borra la base de datos.');
    }

    // Recrear la vista del chatbot DESPUÉS del sync (las tablas ya existen) y después de
    // haber eliminado las vistas al inicio. Sin esto, el chatbot Foody devuelve 500 porque
    // la vista "chatbotData" no existe en la base de datos.
    await crearVistaChatbot();

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

// Crea (o recrea) la vista que alimenta al chatbot "Foody".
// Es necesaria porque al arrancar se eliminan todas las vistas del schema public
// para permitir que Sequelize altere los esquemas de las tablas. Si no la volvemos
// a crear, el chatbot falla con: relation "public.chatbotdata" does not exist.
// El nombre se deja SIN comillas a propósito para que Postgres lo normalice a
// minúsculas (chatbotdata), igual que la consulta del chatbot (SELECT * FROM public.chatbotData).
export async function crearVistaChatbot() {
  const createViewSql = `
    CREATE OR REPLACE VIEW chatbotData AS
    SELECT ev.id,
           ev.nombre,
           ev.descripcion,
           ev."tipoEvento",
           (SELECT date(min(de."fechaHoraInicioDiaEvento"))
            FROM "diaEventos" de
            WHERE de."eventoId" = ev.id) AS "fechaInicioEvento",
           (SELECT date(max(de."fechaHoraFinDiaEvento"))
            FROM "diaEventos" de
            WHERE de."eventoId" = ev.id) AS "fechaFinEvento",
           ev."conButaca",
           ev."tienePreventa",
           ev."linkVentaEntradas",
           ev.ubicacion,
           ev.localidad,
           ev.provincia,
           ev.estado,
           string_agg(DISTINCT ps."nombreCarro"::text, ', '::text) AS "nombreCarroLista",
           string_agg(DISTINCT ps."tipoNegocio"::text, ', '::text) AS "tipoNegocioLista"
    FROM eventos ev
         LEFT JOIN "Asociacions" ac ON ev.id = ac."eventoId"
         LEFT JOIN puestos ps ON ac."puestoId" = ps.id
    WHERE ev.estado IN ('EnCurso', 'Confirmado')
    GROUP BY ev.id;
  `;

  try {
    await withDbRetry('crear vista chatbotData', async () => {
      await sequelize.query(createViewSql);
    });
    console.log('Vista chatbotData creada/actualizada correctamente.');
  } catch (error) {
    console.error('Error al crear la vista chatbotData:', error.message || error);
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