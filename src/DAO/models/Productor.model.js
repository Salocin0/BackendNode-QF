import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Evento } from './evento.model.js';

export const Productor = sequelize.define('Productor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cuit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  razonSocial: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  estaValido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  condicionIva: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});
Productor.hasOne(Evento, {
  foreinkey: 'eventoId',
  sourceKey: 'id',
});

Evento.belongsTo(Productor, {
  foreinkey: 'eventoId',
  targetId: 'id',
});