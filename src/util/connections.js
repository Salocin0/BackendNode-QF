import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sslOption = process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false;

const connectionString = process.env.DB_URL;

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});