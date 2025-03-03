import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { ItemCarrito } from './itemCarrito.js';
import { Consumidor } from './consumidor.model.js';

export const Carrito = sequelize.define(
  'Carrito',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { timestamps: true }
);
Carrito.hasMany(ItemCarrito, { foreignKey: 'carritoId', onDelete: 'CASCADE' });
Carrito.belongsTo(Consumidor, { foreignKey: 'consumidorId' })
