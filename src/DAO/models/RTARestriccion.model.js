import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Restriccion } from './Restriccion.model.js';

export const RTARestriccion = sequelize.define('RTARestriccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  respuesta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

RTARestriccion.belongsTo(Restriccion, {
  foreinkey: 'puestoId',
  sourceKey: 'id',
});

Restriccion.hasOne(RTARestriccion, {
  foreinkey: 'puestoId',
  targetId: 'id',
});
