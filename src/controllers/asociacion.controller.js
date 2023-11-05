import { asociacionService } from "../services/asociacion.service.js";

class AsociacionController {
  async getAllController(req, res) {
    try {
      const consumidorid = req.headers['consumidorid'];
      const asociaciones = await asociacionService.getAll(consumidorid);
      if (asociaciones) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all asociaciones',
          data: asociaciones,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociaciones not found',
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

  async getAllInEventController(req, res) {
    try {
      const id = req.params.id;
      const asociaciones = await asociacionService.getAllInEvent(id);
      if (asociaciones) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all asociaciones',
          data: asociacionService,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociaciones not found',
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

  async getOneController(req, res) {
    try {
      const Id = req.params.id;
      const asociacion = await asociacionService.getOne(Id);
      if (asociacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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
      const asociacion = await asociacionService.rechazar(Id);
      if (asociacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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
      const asociacion = await asociacionService.aceptar(Id);
      if (asociacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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

  async createOneController(req, res) {
    try {
      const { estado, eventoId, puestoId, repartidorId, respuestas} = req.body;
      const nuevaAsociacion = {
        estado: estado,
        puestoId: puestoId,
        repartidorId: repartidorId,
        eventoId: eventoId,
      };

      const asociacionCreado = await asociacionService.create(nuevaAsociacion,respuestas);

      return res.status(200).json({
        status: 'success',
        msg: 'Restriccion created',
        code: 200,
        data: asociacionCreado,
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

export const asociacionController = new AsociacionController();
