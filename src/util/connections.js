import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false;

const connectionString = process.env.DB_URL;

export const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: sslOption,
      },
    })
  : new Sequelize({
      database: process.env.DB_NAME ? String(process.env.DB_NAME) : undefined,
      username: process.env.DB_USER ? String(process.env.DB_USER) : undefined,
      password: process.env.DB_PASSWORD != null ? String(process.env.DB_PASSWORD) : undefined,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      host: process.env.DB_HOST ? String(process.env.DB_HOST) : undefined,
      schema: process.env.DB_SCHEMA ? String(process.env.DB_SCHEMA) : undefined,
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions: {
        ssl: sslOption,
      },
    });