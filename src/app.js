import cookieParser from "cookie-parser";
import express from "express";
import { __dirname } from "./dirname.js";
import { RouterUser } from "./routes/user.router.js";
import { RouterLogin } from "./routes/login.router.js";
import { RouterConsumidor } from "./routes/consumidor.router.js";
import { sequelize } from "./utils/connections.js";
import { RouterEncargadoPuesto } from "./routes/encargadoPuesto.router.js";

const app = express();
const port = 8080;

async function connectDB() {
  await sequelize.sync({ force: false });
  app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port);
  });
}

connectDB();

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// URLs
app.use(express.static(__dirname + "/public"));
app.use("/user", RouterUser);
app.use("/consumidor", RouterConsumidor);
app.use("/login", RouterLogin);
app.use("/encargado", RouterEncargadoPuesto);