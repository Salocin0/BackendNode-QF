import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Consumidor } from './consumidor.model.js';
import { ValoracionPuesto } from './valoracionCarrito.model.js';
import { ValoracionRepartidor } from './valoracionRepartidor.model.js';

export const Usuario = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  emailValidado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaAlta: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  codigoRecuperacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  codigoValidacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  codigoHabilitacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tipoUsuario: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      return this.getDataValue('tipoUsuario');
    },
    set(value) {
      this.setDataValue('tipoUsuario', value);
    },
  },
});

Usuario.hasOne(Consumidor, {
  foreinkey: 'consumidorId',
  sourceKey: 'id',
});

Consumidor.belongsTo(Usuario, {
  foreinkey: 'consumidorId',
  targetId: 'id',
});

Consumidor.hasOne(Usuario, {
  foreinkey: 'consumidorId',
  sourceKey: 'id',
});

Usuario.belongsTo(Consumidor, {
  foreinkey: 'consumidorId',
  targetId: 'id',
});
