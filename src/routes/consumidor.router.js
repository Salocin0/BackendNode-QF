import express from "express";
export const RouterConsumidor = express.Router();
import { Consumidor } from "../DAO/models/consumidor.model.js";

RouterConsumidor.get('/', async (req, res) => {
    try{
      const consumidores = await Consumidor.findAll()
      if( consumidores.length>0){
        return res.status(200).json({
          status: "sucess",
          msg: "Found all consumidores",
          data: consumidores,
        })
      }else{
        return res.status(404).json({
          status: "Error",
          msg: "consumidores not found",
          data: {},
        })
      }
    }catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
    });
  
    RouterConsumidor.get('/:id', async(req, res) => {
      try {
        const consumidorId = req.params.id;
        const consumidor = await Consumidor.findByPk(consumidorId)
        if (consumidor !== null) {
          return res.status(200).json({
            status: "sucess",
            msg: "consumidor found",
            data: consumidor,
          })
        } else {
          return res.status(404).json({
            status: "Error",
            msg: "consumidor with id " + req.params.id + " not found",
            data: {},
          })
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

    RouterConsumidor.get('/user/:id', async(req, res) => {
      try {
        const usuarioId = req.params.id;
        const consumidor = await Consumidor.findOne({
          where: {
            usuarioId: usuarioId
          },
        });
        if (consumidor !== null) {
          return res.status(200).json({
            status: "sucess",
            msg: "consumidor found",
            data: consumidor,
          })
        } else {
          return res.status(404).json({
            status: "Error",
            msg: "consumidor with id " + req.params.id + " not found",
            data: {},
          })
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


    