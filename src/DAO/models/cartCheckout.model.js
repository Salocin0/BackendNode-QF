import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';

// Like the other models, this new table is created by the normal sync({ force:false }) startup.
export const CartCheckout = sequelize.define('CartCheckout', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consumidorId: { type: DataTypes.INTEGER, allowNull: false },
  carritoId: { type: DataTypes.INTEGER, allowNull: false },
  snapshot: { type: DataTypes.JSON, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  paymentIntentId: { type: DataTypes.STRING, unique: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  result: { type: DataTypes.JSON },
});
