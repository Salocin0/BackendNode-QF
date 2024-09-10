import { asignacionService } from "../services/asignacion.service.js";

class AsignacionController {
  async getOneController(req, res) {
    try {
      const consumidorid = req.headers['consumidorid'];
      console.log(consumidorid)
      const asignacion = await asignacionService.getOne(consumidorid);
      console.log(asignacion)
      if (asignacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asignacion found',
          data: asignacion,
        });
      } else {
        return res.status(200).json({
          status: 'Error',
          msg: 'asignacion with id ' + req.params.id + ' not found',
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

  async rechazarController(req, res) {
    try {
      const Id = req.params.id;
      const asignacion = await asignacionService.rechazar(Id);
      if (asignacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asignacion found',
          data: asignacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asignacion with id ' + req.params.id + ' not found',
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

  async aceptarController(req, res) {
    try {
      const Id = req.params.id;
      const asignacion = await asignacionService.aceptar(Id);
      if (asignacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asignacion found',
          data: asignacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asignacion with id ' + req.params.id + ' not found',
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
}

export const asignacionController = new AsignacionController();
