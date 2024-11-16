import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  schema: process.env.DB_SCHEMA,
  dialect: process.env.DB_DIALECT || 'postgres',
  dialectOptions: process.env.DB_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Cambiar a true si quieres validar el certificado en producción
    },
  } : {}, // No incluir opciones SSL si no se necesita
});
