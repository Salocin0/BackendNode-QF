import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Puesto } from './puesto.model.js';

export const ValoracionPuesto = sequelize.define('valoracionPuesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  calidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tiempo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  puestoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

ValoracionPuesto.belongsTo(Puesto, {
  foreignKey: 'puestoId',
  targetKey: 'id',
});
