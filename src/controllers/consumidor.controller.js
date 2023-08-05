import { consumidorService } from '../services/consumidor.service.js';

class ConsumidorController {
  async getAllController(req, res) {
    try {
      const consumidores = await consumidorService.getAll();
      if (consumidores.length > 0) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all consumidores',
          data: consumidores,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'consumidores not found',
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
      const consumidorId = req.params.id;
      const consumidor = await consumidorService.getOne(consumidorId);
      if (consumidor !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'consumidor found',
          data: consumidor,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'consumidor with id ' + req.params.id + ' not found',
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
      const { consumidor } = req.body;
      const result = await consumidorService.updateOne(id, consumidor);    
      return res.status(200).json({
        status: 'success',
        msg: 'consumidor is updated',
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
}

export const consumidorController = new ConsumidorController();
