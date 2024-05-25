import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';

export const PuntoEncuentro = sequelize.define('puntoEncuentro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  longitud: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitud: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  habilitado:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue:true
  }
});
