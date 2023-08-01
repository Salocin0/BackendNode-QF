import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { EncargadosPuestos } from './encargadoPuesto.model.js';
import { Productores } from './Productor.model.js';

export const Consumidor = sequelize.define('consumidores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
  },
  apellido: {
    type: DataTypes.STRING,
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dni: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  habilidato: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

EncargadosPuestos.hasOne(Consumidor, {
  foreignKey: 'encargadoId',
  sourceKey: 'id',
});

Consumidor.belongsTo(EncargadosPuestos, {
  foreignKey: 'encargadoId',
  targetKey: 'id',
});

Productores.hasOne(Consumidor, {
  foreignKey: 'productorId',
  sourceKey: 'id',
});

Consumidor.belongsTo(Productores, {
  foreignKey: 'productorId',
  targetKey: 'id',
});

/*
Repartidor.hasOne(Consumidor, {
  foreignKey: 'repartidorId',
  sourceKey: 'id',
});

Consumidor.belongsTo(Repartidor, {
  foreignKey: 'repartidorId',
  targetKey: 'id',
});*/
