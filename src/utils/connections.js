import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  "nodeDB",//name db
  "Salocin0",//user db
  "ProyectoFinal",//pass
  {
    host: "localhost",
    dialect: "mysql",
  }
);