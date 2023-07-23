import express from "express";
export const RouterEncargadoPuesto = express.Router();
import { EncargadosPuestos } from "../DAO/models/encargadoPuesto.model.js";

RouterEncargadoPuesto.get('/', async (req, res) => {
    try{
      const encargados = await EncargadosPuestos.findAll()
      if( encargados.length>0){
        return res.status(200).json({
          status: "sucess",
          msg: "Found all users",
          data: encargados,
        })
      }else{
        return res.status(404).json({
          status: "Error",
          msg: "Users not found",
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
  
    RouterEncargadoPuesto.get('/:id', async(req, res) => {
      try {
        const encargadoId = req.params.id;
        const encargado = await EncargadosPuestos.findByPk(encargadoId)
        if (encargado !== null) {
          return res.status(200).json({
            status: "sucess",
            msg: "user found",
            data: encargado,
          })
        } else {
          return res.status(404).json({
            status: "Error",
            msg: "user with id " + req.params.id + " not found",
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

    RouterEncargadoPuesto.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { razonSocial,cuit,fechaBromatologica } = req.body;
      const encargado = await EncargadosPuestos.findByPk(id)
      encargado.razonSocial=razonSocial
      encargado.cuit = cuit
      encargado.fechaBromatologica=fechaBromatologica
      await encargado.save()
      return res.status(200).json({
        status: 'success',
        msg: 'encargado is updated',
        data: encargado,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  });

  RouterEncargadoPuesto.post("/", async (req, res) => {
    try {
      const { encargado } = req.body;
      const nuevoEncargado = {
        usuarioId:encargado.id,
        cuit:encargado.cuit,
        razonSocial:encargado.razonSocial,
        fechaBromatologica:encargado.fechaBromatologica,
      }
      const encargadoCreado = await EncargadosPuestos.create(nuevoEncargado);

      return res.status(201).json({
        status: 'success',
        msg: 'encargado created',
        data: encargadoCreado
      });
    } catch (e) {
      console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
    }
  });

  RouterEncargadoPuesto.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const encargado = await EncargadosPuestos.findByPk(id);
      await encargado.destroy()
      return res.status(200).json({
        status: 'success',
        msg: 'encargado deleted',
        data: encargado,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  });