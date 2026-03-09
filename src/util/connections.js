import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false;
const forceSqlite = process.env.DB_FORCE_SQLITE === 'true';

const connectionString = process.env.DB_URL;
let sequelize;

// If a Postgres connection string is provided, use Postgres. Otherwise fall back to in-memory SQLite (dev/test).
if (!forceSqlite && connectionString && connectionString.startsWith('postgres')) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    dialectOptions: sslOption ? { ssl: sslOption } : {},
    pool: {
      max: Number(process.env.DB_POOL_MAX || 10),
      min: Number(process.env.DB_POOL_MIN || 0),
      acquire: Number(process.env.DB_POOL_ACQUIRE_MS || 60000),
      idle: Number(process.env.DB_POOL_IDLE_MS || 10000),
      evict: Number(process.env.DB_POOL_EVICT_MS || 1000),
    },
    retry: {
      max: Number(process.env.DB_QUERY_RETRY_MAX || 3),
      match: [/ECONNRESET/i, /SequelizeConnectionError/i, /Connection terminated unexpectedly/i, /57P03/i],
    },
    logging: false,
  });
} else if (!forceSqlite && process.env.DB_DIALECT === 'postgres' && process.env.DB_HOST) {
  // Support explicit Postgres config via separate env vars
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: 'postgres',
    dialectOptions: sslOption ? { ssl: sslOption } : {},
    pool: {
      max: Number(process.env.DB_POOL_MAX || 10),
      min: Number(process.env.DB_POOL_MIN || 0),
      acquire: Number(process.env.DB_POOL_ACQUIRE_MS || 60000),
      idle: Number(process.env.DB_POOL_IDLE_MS || 10000),
      evict: Number(process.env.DB_POOL_EVICT_MS || 1000),
    },
    retry: {
      max: Number(process.env.DB_QUERY_RETRY_MAX || 3),
      match: [/ECONNRESET/i, /SequelizeConnectionError/i, /Connection terminated unexpectedly/i, /57P03/i],
    },
    logging: false,
  });
} else {
  // Default: in-memory sqlite for local development/tests
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || ':memory:',
    logging: false,
  });
}

export { sequelize };