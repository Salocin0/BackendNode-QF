import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Usuario } from './users.model.js';

export const Notificacion = sequelize.define('notificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Fecha actual por defecto
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pendiente', // Puedes ajustar el valor por defecto
  },
  dispositivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Relación de Notificación con Usuario
Notificacion.belongsTo(Usuario, {
  foreignKey: 'usuarioId', // Clave foránea en Notificacion que referencia al usuario
  as: 'usuario',
});

Usuario.hasMany(Notificacion, {
  foreignKey: 'usuarioId',
  as: 'notificaciones',
});
