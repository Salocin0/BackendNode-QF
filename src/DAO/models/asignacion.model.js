import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Repartidor } from './repartidor.model.js';
import { Pedido } from "./pedido.model.js" 

export const Asignacion = sequelize.define('Asignacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  }
  
});

Asignacion.belongsTo(Repartidor, {
  foreignKey: 'repartidoreId',
  targetKey: 'id',
});

Repartidor.hasMany(Asignacion, {
  foreignKey: 'repartidoreId',
  sourceKey: 'id',
});

Asignacion.belongsTo(Pedido, {
  foreignKey: 'PedidoId',
  targetKey: 'id',
});

Pedido.hasMany(Asignacion, {
  foreignKey: 'PedidoId',
  sourceKey: 'id',
});
