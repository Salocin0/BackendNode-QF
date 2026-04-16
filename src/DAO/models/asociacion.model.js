import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { RTARestriccion } from './RTARestriccion.model.js';
import { Evento } from './evento.model.js';
import { Puesto } from './puesto.model.js';
import { Repartidor } from './repartidor.model.js';
import { Asignacion } from './asignacion.model.js';

export const Asociacion = sequelize.define('Asociacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  motivo:{
    type: DataTypes.STRING,
    allowNull: true,
  }
  
});

Asociacion.belongsTo(Evento, {
  foreignKey: 'eventoId',
  targetKey: 'id',
});

Evento.hasMany(Asociacion, {
  foreignKey: 'eventoId',
  sourceKey: 'id',
});

Asociacion.belongsTo(Puesto, {
  foreignKey: 'puestoId',
  targetKey: 'id',
});

Puesto.hasMany(Asociacion, {
  foreignKey: 'puestoId',
  sourceKey: 'id',
});

Asociacion.belongsTo(Repartidor, {
  foreignKey: 'repartidoreId',
  targetKey: 'id',
});

Repartidor.hasMany(Asociacion, {
  foreignKey: 'repartidoreId',
  sourceKey: 'id',
});

Asociacion.hasMany(RTARestriccion, {
  foreignKey: 'asociacionId',
  sourceKey: 'id',
});

RTARestriccion.belongsTo(Asociacion, {
  foreignKey: 'asociacionId',
  targetKey: 'id',
});
