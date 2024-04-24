import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Consumidor } from './consumidor.model.js';
import { Puesto } from './puesto.model.js';
import { Repartidor } from './repartidor.model.js';

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
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Consumidor.hasOne(Pedido, {
  foreignKey: 'consumidorId',
  sourceKey: 'id',
});

Pedido.belongsTo(Consumidor, {
  foreignKey: 'consumidorId',
  targetKey: 'id',
});

Puesto.hasOne(Pedido, {
  foreignKey: 'puestoId',
  sourceKey: 'id',
});

Pedido.belongsTo(Puesto, {
  foreignKey: 'puestoId',
  targetKey: 'id',
});

Repartidor.hasOne(Pedido, {
  foreignKey: 'repartidorId',
  sourceKey: 'id',
});

Pedido.belongsTo(Repartidor, {
  foreignKey: 'repartidorId',
  targetKey: 'id',
});
