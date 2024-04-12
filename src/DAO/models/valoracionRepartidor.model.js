import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Repartidor } from './repartidor.model.js';

export const ValoracionRepartidor = sequelize.define('valoracionRepartidor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valorValoracion: {
    type: DataTypes.STRING,
    allowNull: false,
  },

});


Repartidor.belongsTo(Repartidor, {
    foreignKey: 'repartidorId',
    targetKey: 'id',
  });