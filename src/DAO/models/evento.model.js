import DataTypes from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { DiaEvento } from './diaEvento.model.js';
import { Productor } from './Productor.model.js';
import { PuntoEncuentro } from './puntoEncuentro.model.js';

export const Evento = sequelize.define('evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipoEvento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipoPago: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cantidadPuestos: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cantidadRepartidores: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  capacidadMaxima: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  conButaca: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  conRepartidor: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  conPreventa: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
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
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkVentaEntradas: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  img: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  croquis: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

DiaEvento.belongsTo(Evento, {
  foreignKey: 'eventoId',
  sourceKey: 'id',
});

Evento.hasMany(DiaEvento, {
  foreignKey: 'eventoId',
  targetKey: 'id',
});

Evento.belongsTo(Productor, {
  foreignKey: 'productorId',
  targetKey: 'id',
});

Productor.hasOne(Evento, {
  foreignKey: 'productorId',
  sourceKey: 'id',
});

PuntoEncuentro.belongsTo(Evento, {
  foreignKey: 'eventoId',
  sourceKey: 'id',
});

Evento.hasMany(PuntoEncuentro, {
  foreignKey: 'eventoId',
  targetKey: 'id',
});
