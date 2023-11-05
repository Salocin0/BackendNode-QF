import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Evento } from './evento.model.js';
import { Puesto } from './puesto.model.js';
import { Repartidor } from './repartidor.model.js';
import { RTARestriccion } from './RTARestriccion.model.js';

export const Asocioacion = sequelize.define('Asocioacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pendiente',
  },
});
Asocioacion.belongsTo(Evento, {
  foreinkey: 'eventoId',
  sourceKey: 'id',
});

Evento.hasOne(Asocioacion, {
  foreinkey: 'eventoId',
  targetId: 'id',
});

Asocioacion.belongsTo(Puesto, {
  foreinkey: 'puestoId',
  sourceKey: 'id',
});

Puesto.hasOne(Asocioacion, {
  foreinkey: 'puestoId',
  targetId: 'id',
});

Asocioacion.belongsTo(Repartidor, {
  foreinkey: 'repartidorId',
  sourceKey: 'id',
});

Repartidor.hasOne(Asocioacion, {
  foreinkey: 'repartidorId',
  targetId: 'id',
});

Asocioacion.belongsTo(RTARestriccion, {
  foreinkey: 'asociacionId',
  sourceKey: 'id',
});

RTARestriccion.hasMany(Asocioacion, {
  foreinkey: 'asociacionId',
  targetId: 'id',
});
