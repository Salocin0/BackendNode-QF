import { consumidorService } from '../services/consumidor.service.js';
import { encargadoService } from '../services/encargado.service.js';

class EncargadoController {
  async getAllcontroller(req, res) {
    try {
      const encargados = await encargadoService.getAll();
      if (encargados.length > 0) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all Encargados',
          data: encargados,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'Encargado not found',
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

      console.log("Este  es el ID: " + consumidor.encargadoId);

      const { razonSocialEPC, cuitEPC } = req.body;

      console.log(id, razonSocialEPC, cuitEPC);

      const result = await encargadoService.updateOne(consumidor.encargadoId, { razonSocialEPC, cuitEPC });

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

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const consumidor = await consumidorService.getOne(id);

      console.log("Este  es el ID: " + consumidor.encargadoId);

      const result = await encargadoService.deleteOne(consumidor.encargadoId);

      return res.status(200).json({
        status: 'success',
        msg: 'Encargado eliminado correctamente',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Ocurrió un error al eliminar el encargado :(',
        data: {},
      });
    }
  }



}

export const encargadoController = new EncargadoController();
