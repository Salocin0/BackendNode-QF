import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

export const Puesto = sequelize.define('puesto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreCarro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numeroCarro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipoNegocio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner:{
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    img:{
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    telefonoCarro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });