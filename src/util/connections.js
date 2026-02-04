import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false;

const connectionString = process.env.DB_URL;
let sequelize;

// If a Postgres connection string is provided, use Postgres. Otherwise fall back to in-memory SQLite (dev/test).
if (connectionString && connectionString.startsWith('postgres')) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    dialectOptions: sslOption ? { ssl: sslOption } : {},
    logging: false,
  });
} else if (process.env.DB_DIALECT === 'postgres' && process.env.DB_HOST) {
  // Support explicit Postgres config via separate env vars
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: 'postgres',
    dialectOptions: sslOption ? { ssl: sslOption } : {},
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