import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

export const DiaEvento = sequelize.define('diaEvento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  horarioInicioEvento: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horarioFinEvento: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horarioInicioPreVenta: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horarioFinPreVenta: {
    type: DataTypes.TIME,
    allowNull: false,
  },
});
