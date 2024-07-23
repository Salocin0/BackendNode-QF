import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Repartidor } from './repartidor.model.js';
import { Pedido } from "./pedido.model.js" 

export const Asignacion = sequelize.define('Asignacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  }
  
});
Asignacion.belongsTo(Repartidor, {
  foreinkey: 'repartidorId',
  sourceKey: 'id',
});

Repartidor.hasOne(Asignacion, {
  foreinkey: 'repartidorId',
  targetId: 'id',
});

Asignacion.belongsTo(Pedido, {
  foreinkey: 'repartidorId',
  sourceKey: 'id',
});

Pedido.hasOne(Asignacion, {
  foreinkey: 'repartidorId',
  targetId: 'id',
});