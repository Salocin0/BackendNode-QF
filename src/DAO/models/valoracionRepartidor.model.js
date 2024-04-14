import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Repartidor } from './repartidor.model.js';

export const ValoracionRepartidor = sequelize.define('valoracionRepartidor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valorValoracion: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  repartidorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

ValoracionRepartidor.belongsTo(Repartidor, {
  foreignKey: 'repartidorId',
  targetKey: 'id',
});
