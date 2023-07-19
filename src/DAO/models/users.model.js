import { DataTypes } from "sequelize";
import { sequelize } from "./../../utils/connections.js";
import { Consumidor } from "./consumidor.model.js";

export const Usuario = sequelize.define(
  "usuarios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaAlta: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    codigoRecuperacion:{
      type: DataTypes.STRING,
      allowNull: true
    }
  }
);

Usuario.hasOne(Consumidor, {
  foreinkey: "consumidorId",
  sourceKey: "id",
});

Consumidor.belongsTo(Usuario, {
  foreinkey: "consumidorId", 
  targetId: "id" 
});