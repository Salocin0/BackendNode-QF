import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { DiaEvento } from './diaEvento.model.js';

export const Evento = sequelize.define('evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoEvento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoPago: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cantidadPuestos: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidadRepartidores: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  capacidadMaxima: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  conButaca: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  conRepartidor: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  conPreventa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  tipoPreventa: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaInicioPreventa: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fechaFinPreventa: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  plazoCancelacionPreventa: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  linkVentaEntradas: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  img: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  croquis: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  estado:{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'enPreparacion'
  }
});

Evento.hasMany(DiaEvento, {
  foreignKey: 'eventoId',
  sourceKey: 'id',
});

DiaEvento.belongsTo(Evento, {
  foreignKey: 'eventoId',
  targetKey: 'id',
});

