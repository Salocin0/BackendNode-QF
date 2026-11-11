import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';
import { Consumidor } from './consumidor.model.js';
import { ValoracionPuesto } from './valoracionCarrito.model.js';
import { ValoracionRepartidor } from './valoracionRepartidor.model.js';

export const Usuario = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
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
  tokenMobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tokenWeb: {
    type: DataTypes.STRING,
    allowNull: true,
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
  longitud: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  latitud: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

Consumidor.hasOne(Usuario, {
  foreignKey: 'consumidorId',
  sourceKey: 'id',
});

Usuario.belongsTo(Consumidor, {
  foreignKey: 'consumidorId',
  targetKey: 'id',
});

// Secrets and per-user codes/tokens are never part of an API response. Internal code still reads them from the
// instance (e.g. login, notifications); only JSON serialization (res.json) drops them.
export const CAMPOS_PRIVADOS_USUARIO = ['contraseña', 'codigoRecuperacion', 'codigoValidacion', 'codigoHabilitacion', 'tokenMobile', 'tokenWeb'];
Usuario.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  CAMPOS_PRIVADOS_USUARIO.forEach((campo) => delete values[campo]);
  return values;
};
