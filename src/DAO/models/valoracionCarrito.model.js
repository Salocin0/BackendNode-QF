import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Puesto } from './puesto.model.js';

export const ValoracionPuesto = sequelize.define('valoracionPuesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  puntuacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  puestoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

ValoracionPuesto.belongsTo(Puesto, {
  foreignKey: 'puestoId',
  targetKey: 'id',
});
