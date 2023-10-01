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
    allowNull: false,
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
    allowNull: false,
  },
  fechaFinPreventa: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  plazoCancelacionPreventa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  linkVentaEntradas: {
    type: DataTypes.STRING,
    allowNull: false,
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  croquis: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Evento.hasMany(DiaEvento, {
  foreignKey: 'eventoId',
  sourceKey: 'id',
});

DiaEvento.belongsTo(Evento, {
  foreignKey: 'eventoId',
  targetKey: 'id',
});

