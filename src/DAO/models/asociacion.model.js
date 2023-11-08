import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Evento } from './evento.model.js';
import { Puesto } from './puesto.model.js';
import { Repartidor } from './repartidor.model.js';
import { RTARestriccion } from './RTARestriccion.model.js';

export const Asociacion = sequelize.define('Asociacion', {
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
Asociacion.belongsTo(Evento, {
  foreinkey: 'eventoId',
  sourceKey: 'id',
});

Evento.hasOne(Asociacion, {
  foreinkey: 'eventoId',
  targetId: 'id',
});

Asociacion.belongsTo(Puesto, {
  foreinkey: 'puestoId',
  sourceKey: 'id',
});

Puesto.hasOne(Asociacion, {
  foreinkey: 'puestoId',
  targetId: 'id',
});

Asociacion.belongsTo(Repartidor, {
  foreinkey: 'repartidorId',
  sourceKey: 'id',
});

Repartidor.hasOne(Asociacion, {
  foreinkey: 'repartidorId',
  targetId: 'id',
});

Asociacion.hasMany(RTARestriccion, {
  foreinkey: 'asociacionId',
  sourceKey: 'id',
});

RTARestriccion.belongsTo(Asociacion, {
  foreinkey: 'asociacionId',
  targetId: 'id',
});
