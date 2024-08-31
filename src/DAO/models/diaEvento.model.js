import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

export const DiaEvento = sequelize.define('diaEvento', {
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
  fechaHoraInicioDiaEvento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fechaHoraFinDiaEvento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tienePreventa: {
    type: DataTypes.BOOLEAN,
    allowNull: false, // Cambiado a true
  },
  eventoId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'eventos', // El nombre del modelo que se está referenciando
      key: 'id',
    },
    allowNull: false,
  },
});
