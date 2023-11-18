import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Producto } from './producto.model.js';
import { Pedido } from './pedido.model.js';

export const DetallePedido = sequelize.define('DetallePedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Producto.hasOne(DetallePedido, {
  foreignKey: 'productoId',
  sourceKey: 'id',
});

DetallePedido.belongsTo(Producto, {
  foreignKey: 'productoId',
  targetKey: 'id',
});

Pedido.hasOne(DetallePedido, {
  foreignKey: 'PedidoId',
  sourceKey: 'id',
});

DetallePedido.belongsTo(Pedido, {
  foreignKey: 'PedidoId',
  targetKey: 'id',
});
