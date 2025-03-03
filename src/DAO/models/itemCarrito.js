import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Producto } from './producto.model.js';
import { Evento } from './evento.model.js';

export const ItemCarrito = sequelize.define(
  'ItemCarrito',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true }
);
ItemCarrito.belongsTo(Producto, { foreignKey: 'productoId', allowNull: false });
ItemCarrito.belongsTo(Evento, { foreignKey: 'eventoId', allowNull: false });
