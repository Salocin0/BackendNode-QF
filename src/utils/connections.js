import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  "nodeDB",
  "Salocin0",
  "ProyectoFinal",
  {
    host: "localhost",
    dialect: "mysql",
  }
);