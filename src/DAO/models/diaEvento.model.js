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
    allowNull: true, // Cambiado a true
  },
  horarioFinPreVenta: {
    type: DataTypes.TIME,
    allowNull: true, // Cambiado a true
  },
  eventoId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'eventos', // El nombre del modelo que se está referenciando
      key: 'id',
    },
    allowNull: false,
  },
});
