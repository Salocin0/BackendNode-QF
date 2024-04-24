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
    type: DataTypes.DOUBLE,
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

Pedido.hasMany(DetallePedido, {
  foreignKey: 'PedidoId',
  sourceKey: 'id',
  as: 'detalles',
});

DetallePedido.belongsTo(Pedido, {
  foreignKey: 'PedidoId',
  targetKey: 'id',
});
