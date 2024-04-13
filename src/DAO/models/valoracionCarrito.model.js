import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Puesto } from './puesto.model.js';

export const ValoracionPuesto = sequelize.define('valoracionPuesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valorValoracionPuesto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Puesto.belongsTo(Puesto, {
  foreignKey: 'puestoId',
  targetKey: 'id',
});
