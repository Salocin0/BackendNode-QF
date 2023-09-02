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
}

export const encargadoController = new EncargadoController();
