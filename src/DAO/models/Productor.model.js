import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';

export const Productor = sequelize.define('productor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cuit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  razonSocial: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  estaValido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  condicionIva: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
