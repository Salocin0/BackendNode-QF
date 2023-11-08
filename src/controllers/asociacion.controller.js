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
          code: 200,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociaciones not found',
          data: {},
          code: 404,
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
        code: 500,
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
      const eventoid = req.params.eventoId;
      const puestoId = req.params.puestoId;
      const consumidorId = req.params.consumidorId;
      const { restricciones } = req.body;
      const nuevaAsociacion = {
        puestoId: Number(puestoId),
        repartidorId: consumidorId,
        eventoId: Number(eventoid),
      };

      const asociacionCreado = await asociacionService.create(nuevaAsociacion,restricciones,consumidorId);

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

  async createSimpleOneController(req, res) {
    try {
      const eventoid = req.params.eventoId;
      const puestoId = req.params.puestoId;
      const consumidorId = req.params.consumidorId;
      const nuevaAsociacion = {
        puestoId: Number(puestoId),
        repartidoreId: consumidorId,
        eventoId: Number(eventoid),
      };

      const asociacionCreado = await asociacionService.create(nuevaAsociacion,null,consumidorId);

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
