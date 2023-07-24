import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  "quickfooddb",//name db
  "root",//user db
  "proyectofinal",//pass
  {
    host: "localhost",
    dialect: "mysql",
  }
);