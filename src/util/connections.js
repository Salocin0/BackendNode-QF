import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // If in production, use the full connection URL
  const dbUrl = process.env.DB_URL || '';

  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, 
        rejectUnauthorized: false,  // Disable certificate validation (for cloud-hosted DBs like Render)
      },
    },
  });
} else {
  // If not in production, use the environment variables
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
      : {}, // Use SSL if DB_SSL is 'true', otherwise no SSL
  });
}

export { sequelize };
