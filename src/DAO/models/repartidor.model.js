import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

export const Repartidor = sequelize.define('repartidores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
});
