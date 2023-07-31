import express from "express";
export const RouterLogin = express.Router();
import { Usuario } from "../DAO/models/users.model.js";

RouterLogin.post("/", async (req, res) => {
    try {
        const { correoElectronico,contraseña } = req.body;
        let usuario = await Usuario.findOne({
            where: {
              email: correoElectronico,         
              contraseña: contraseña 
            },
          });

          if (!usuario) {
            usuario = await Usuario.findOne({
              where: {
                usuario: correoElectronico,
                contraseña: contraseña,
              },
            });
          }
      

        if (usuario !== null){
            return res.status(200).json({
                status: 'success',
                msg: 'user login',
                code:200,
                data: usuario
              });
        }else{
            return res.status(400).json({
                status: 'error',
                msg: 'email o contraseña incorrecto',
                code:1000,
                data: null
              });
        }
    } catch (e) {
      console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
    }
  });
