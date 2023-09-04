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
      const consumidor = await consumidorService.getOne(id);

      console.log("Este  es el ID: " + consumidor.id);

      const { nombreC,apellidoC, dniC , fechaNacimiento, provinciaC , localidad , telefono } = req.body;

      console.log(id, nombreC, apellidoC , dniC , fechaNacimiento, provinciaC, localidad , telefono);

      const result = await consumidorService.updateOneNew(consumidor.id, { nombreC, apellidoC , dniC , fechaNacimiento, provinciaC, localidad , telefono });

      return res.status(200).json({
        status: 'success',
        msg: 'Encargado actualizado correctamente',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Ocurrió un error al actualizar el encargado :(',
        data: {},
      });
    }
  }
}

export const consumidorController = new ConsumidorController();