import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Si es producción, usar la URL completa de conexión
  const dbUrl = process.env.DB_URL || '';

  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }  // Configuración de SSL
    },
  });
} else {
  // Si no es producción, usa la configuración anterior
  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    schema: process.env.DB_SCHEMA,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: process.env.DB_SSL === 'true' 
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}, // Si DB_SSL es 'true', usa SSL, sino no.
  });
}

export { sequelize };
