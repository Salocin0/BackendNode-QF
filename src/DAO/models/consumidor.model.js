import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

export const Consumidor = sequelize.define('consumidores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
  },
  apellido: {
    type: DataTypes.STRING,
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dni: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
});
