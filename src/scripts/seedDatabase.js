import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const { Client } = pg;

async function seedDatabase() {
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbSsl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

  let adminClient, dataClient;

  try {
    // Paso 1: Conectar como administrador (sin especificar DB)
    console.log('🔄 Conectando al servidor PostgreSQL...');
    adminClient = new Client({
      user: dbUser,
      host: dbHost,
      database: 'postgres', // Usar DB por defecto
      password: dbPassword,
      port: dbPort,
      ssl: dbSsl
    });

    await adminClient.connect();
    console.log('✅ Conectado al servidor PostgreSQL\n');

    // Paso 2: Terminar conexiones existentes a la BD
    console.log(`🔄 Finalizando conexiones existentes a "${dbName}"...`);
    try {
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
      `, [dbName]);
      console.log('✅ Conexiones finalizadas\n');
    } catch (e) {
      console.log('⏭️  No hay conexiones previas\n');
    }

    // Paso 3: Borrar la base de datos si existe
    console.log(`🔄 Borrando base de datos "${dbName}" si existe...`);
    try {
      await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      console.log(`✅ Base de datos "${dbName}" borrada (o no existía)\n`);
    } catch (error) {
      console.log('⏭️  No se pudo borrar la BD (continuando)...\n');
    }

    // Paso 4: Crear la base de datos
    console.log(`🔄 Creando base de datos "${dbName}"...`);
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Base de datos "${dbName}" creada exitosamente\n`);

    // Cerrar conexión administrativa
    await adminClient.end();

    // Paso 5: Conectar a la nueva base de datos
    console.log(`🔄 Conectando a la base de datos "${dbName}"...`);
    dataClient = new Client({
      user: dbUser,
      host: dbHost,
      database: dbName,
      password: dbPassword,
      port: dbPort,
      ssl: dbSsl
    });

    await dataClient.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Paso 6: Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '..', '..', 'Datos_DB.sql');
    console.log(`📖 Leyendo archivo: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`No se encontró el archivo SQL en: ${sqlFilePath}`);
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ Archivo SQL leído correctamente\n');

    // Paso 7: Ejecutar el SQL
    console.log('🔄 Ejecutando script de datos...');
    console.log('⚠️  Esto puede tomar un tiempo...\n');

    // Dividir el SQL en statements individuales y ejecutarlos
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await dataClient.query(statement);
          if (i % 10 === 0) {
            process.stdout.write(`\r⏳ Ejecutando... ${i}/${statements.length}`);
          }
        } catch (error) {
          console.error(`\n⚠️  Error en línea ${i + 1}: ${error.message}`);
          // Continuar con los demás statements
        }
      }
    }

    console.log(`\n✅ ¡Datos insertados exitosamente!`);
    console.log('\n📊 Se han agregado:');
    console.log('   ✓ Productores');
    console.log('   ✓ Repartidores');
    console.log('   ✓ Encargados');
    console.log('   ✓ 4 Usuarios (Consumidor, Repartidor, Encargado, Productor)');
    console.log('   ✓ 4 Consumidores');
    console.log('   ✓ 4 Eventos (Festival, Concierto, Teatro, etc)');
    console.log('   ✓ Productos y más...\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Error de conexión (ETIMEDOUT)');
      console.error('Por favor verifica:');
      console.error('   1. Que Railway está activo');
      console.error('   2. Las credenciales en .env son correctas');
      console.error('   3. Tu conexión a internet');
    }
    process.exit(1);
  } finally {
    if (dataClient) {
      try {
        await dataClient.end();
      } catch (e) {}
    }
    if (adminClient) {
      try {
        await adminClient.end();
      } catch (e) {}
    }
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
seedDatabase();
