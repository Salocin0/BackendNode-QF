import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Repartidor } from './repartidor.model.js';

export const ValoracionRepartidor = sequelize.define('valoracionRepartidor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  puntualidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  eficiencia: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repartidorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

ValoracionRepartidor.belongsTo(Repartidor, {
  foreignKey: 'repartidorId',
  targetKey: 'id',
});
