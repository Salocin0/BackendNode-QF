import { DataTypes } from "sequelize";
import { sequelize } from "./../../utils/connections.js";

export const EncargadosPuestos = sequelize.define(
  "encargadosPuestos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cuit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    razonSocial: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fechaBromatologica: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estaValido: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
  }
);