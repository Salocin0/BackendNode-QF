import express from 'express';
export const RouterEncargado= express.Router();
import { Encargado } from '../DAO/models/encargado.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { encargadoController } from '../controllers/encargado.controller.js';

RouterEncargado.get('/', encargadoController.getAllcontroller)

RouterEncargado.get('/:id', async (req, res) => {
  try {
    const encargadoId = req.params.id;
    const encargado = await Encargado.findByPk(encargadoId);
    if (encargado !== null) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'user found',
        data: encargado,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'user with id ' + req.params.id + ' not found',
        data: {},
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

/*RouterEncargado.get('/user/:id', async (req, res) => {
      try {
        const usuarioId = req.params.id;
        const encargado = await Encargado.findOne({
          where: {
            usuarioId: usuarioId
          },
          //incliude:[Consumidor]
        });
    
        console.log(usuarioId);
    
        if (encargado !== null) {
          return res.status(200).json({
            status: "success",
            msg: "Encargado found",
            data: encargado,
          });
        } else {
          return res.status(404).json({
            status: "error",
            msg: "Encargado with id " + req.params.id + " not found",
            data: {},
          });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          status: 'error',
          msg: 'Internal server error',
          data: {},
        });
      }
    });*/

RouterEncargado.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { razonSocial, cuit } = req.body;
    const encargado = await Encargado.findByPk(id);
    encargado.razonSocial = razonSocial;
    encargado.cuit = cuit;
    await encargado.save();
    return res.status(200).json({
      status: 'success',
      msg: 'encargado is updated',
      code: 200,
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

RouterEncargado.post('/', async (req, res) => {
  try {
    const { encargado } = req.body;
    console.log(encargado);
    const nuevoEncargado = {
      cuit: encargado.cuit,
      razonSocial: encargado.razonSocial,
    };
    const encargadoendb = await Encargado.findOne({
      where: {
        razonSocial: nuevoEncargado.razonSocial,
      },
    });
    console.log(encargadoendb);
    if (encargadoendb) {
      return res.status(200).json({
        status: 'error',
        msg: 'encargado used',
        code: 400,
        data: {},
      });
    } else {
      const encargadoCreado = await Encargado.create(nuevoEncargado);
      return res.status(201).json({
        status: 'success',
        msg: 'encargado created',
        code: 200,
        data: encargadoCreado,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      code: 500,
      data: {},
    });
  }
});

RouterEncargado.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const encargado = await Encargado.findByPk(id);
    encargado.habilitado = false;
    await encargado.save();
    return res.status(200).json({
      status: 'success',
      msg: 'encargado deleted',
      code: 200,
      data: encargado,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      code: 500,
      data: {},
    });
  }
});
