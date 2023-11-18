import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Consumidor } from './consumidor.model.js';

export const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

Consumidor.hasOne(Pedido, {
  foreignKey: 'consumidorId',
  sourceKey: 'id',
});

Pedido.belongsTo(Consumidor, {
  foreignKey: 'consumidorId',
  targetKey: 'id',
});
