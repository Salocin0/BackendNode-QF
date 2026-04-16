import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Consumidor } from './consumidor.model.js';
import { Evento } from './evento.model.js';

export const Restriccion = sequelize.define('Restriccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  opciones: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Restriccion.belongsTo(Evento, {
  foreignKey: 'eventoId',
  targetKey: 'id',
});

Evento.hasMany(Restriccion, {
  foreignKey: 'eventoId',
  sourceKey: 'id',
});

Restriccion.belongsTo(Consumidor, {
  foreignKey: 'consumidorId',
  targetKey: 'id',
});

Consumidor.hasMany(Restriccion, {
  foreignKey: 'consumidorId',
  sourceKey: 'id',
});
