import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

export const EncargadosPuestos = sequelize.define('encargadosPuestos', {
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
  habilidato: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});
