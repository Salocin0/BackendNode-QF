import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Puesto } from './puesto.model.js';

export const Producto = sequelize.define('producto', {
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
  aderezos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  img: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

Puesto.hasMany(Producto, {
  foreignKey: 'puestoId',
  sourceKey: 'id',
});

Producto.belongsTo(Puesto, {
  foreignKey: 'puestoId',
  targetKey: 'id',
});
