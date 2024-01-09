import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Encargado } from './encargado.model.js';
//import { Productor } from './productor.model.js';
import { Repartidor } from './repartidor.model.js';

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
  provincia: {
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

Encargado.hasOne(Consumidor, {
  foreignKey: 'encargadoId',
  sourceKey: 'id',
});

Consumidor.belongsTo(Encargado, {
  foreignKey: 'encargadoId',
  targetKey: 'id',
});

Productor.hasOne(Consumidor, {
  foreignKey: 'productorId',
  sourceKey: 'id',
});

Consumidor.belongsTo(Productor, {
  foreignKey: 'productorId',
  targetKey: 'id',
});

Repartidor.hasOne(Consumidor, {
  foreignKey: 'repartidorId',
  sourceKey: 'id',
});

Consumidor.belongsTo(Repartidor, {
  foreignKey: 'repartidorId',
  targetKey: 'id',
});
