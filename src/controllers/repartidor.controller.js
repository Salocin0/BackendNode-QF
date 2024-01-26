import { consumidorService } from '../services/consumidor.service.js';
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
      const consumidor = await consumidorService.getOne(id);
      const idRepartidor = consumidor.repartidorId;
      const idUser = consumidor.usuarioId;
      const result = await repartidorService.updateOne(idRepartidor, idUser);
      if (result) {
        return res.status(200).json({
          status: 'success',
          msg: 'Repartidor is updated',
          code: 200,
          data: result,
        });
      } else {
        return res.status(404).json({
          status: 'error',
          msg: 'Repartidor not found',
          data: {},
        });
      }
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        data: {},
      });
    }
  }

  async createOneController(req, res) {
    try {
      const { repartidor } = req.body;
      const nuevorepartidor = {
        cuit: repartidor.cuit,
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
      const consumidor = await consumidorService.getOne(id);
      const result = await repartidorService.deleteOne(consumidor.repartidorId, consumidor.usuarioId);
      return res.status(200).json({
        status: 'success',
        msg: 'Repartidor eliminado correctamente',
        code: 200,
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'Ocurrió un error al eliminar el repartidor :(',
        data: {},
      });
    }
  }
}

export const repartidorController = new RepartidorController();
