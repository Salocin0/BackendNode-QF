import { repartidorService } from '../services/repartidor.service.js';

class RepartidorController {
  async getAllController(res) {
    try {
      const repartidores = await repartidorService.getAll();
      if (repartidores.length > 0) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all repartidores',
          data: repartidores,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'repartidores not found',
          data: {},
        });
      }
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getOneController(req, res) {
    try {
      const repartidorId = req.params.id;
      const repartidor = await repartidorService.getOne(repartidorId);
      if (repartidor !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'repartidor found',
          data: repartidor,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'repartidor with id ' + req.params.id + ' not found',
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
  }

  async updateOneController(req, res) {
    try {
      const id = req.params.id;
      const { repartidor } = req.body;
      const result = await repartidorService.updateOne(id, repartidor);    
      return res.status(200).json({
        status: 'success',
        msg: 'repartidor is updated',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  //// atributos para crear el repartidoooor
  async createOneController(req, res) {
    try {
      const { repartidor } = req.body;
      const nuevorepartidor = { // atributos para crear el repartidoooor
        nombre: repartidor.nombre,
      };
      const repartidorCreado = await repartidorService.create(nuevorepartidor);
      if (repartidorCreado === false) {
        return res.status(200).json({
          status: 'error',
          msg: 'encargado used',
          code: 400,
          data: {},
        });
      } else {
        return res.status(201).json({
          status: 'success',
          msg: 'encargado created',
          code: 200,
          data: repartidorCreado,
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
  }

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const repartidor = await repartidorService.deleteOne(id);
      return res.status(200).json({
        status: 'success',
        msg: 'encargado deleted',
        code: 200,
        data: repartidor,
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
  }

}

export const repartidorController = new RepartidorController();