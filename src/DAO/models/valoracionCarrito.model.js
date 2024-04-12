import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Carritos } from './carritos.model.js';

export const ValoracionCarrito = sequelize.define('valoracionCarrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valorValoracionCarrito: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Carritos.belongsTo(Carritos, {
  foreignKey: 'carritoId',
  targetKey: 'id',
});
