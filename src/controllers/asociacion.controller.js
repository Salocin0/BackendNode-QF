import { Asociacion } from "../DAO/models/asociacion.model.js";
import { Consumidor } from "../DAO/models/consumidor.model.js";
import { Evento } from "../DAO/models/evento.model.js";
import { Puesto } from "../DAO/models/puesto.model.js";
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
        return res.status(200).json({
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

  async cancelarController(req, res) {
    try {
      const Id = req.params.id;
      const asociacion = await asociacionService.cancelar(Id);
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
      console.log(nuevaAsociacion)
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

      const existingAsociacion = await asociacionService.getByEventoPuesto(
        Number(eventoid),
        Number(puestoId)
      );

      if (existingAsociacion) {
        return res.status(400).json({
          status: 'error',
          msg: 'La asociación para este evento y puesto ya existe',
          code: 400,
          data: {},
        });
      }

      return res.status(200).json({
        status: 'success',
        msg: 'Asociación creada exitosamente',
        code: 200,
        data: {},
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Algo salió mal :(',
        code: 500,
        data: {},
      });
    }
  }

  async getAllByConsumidorId(req, res) {
    try {
      const { consumidorId } = req.params;
      console.log("aca es" + consumidorId);
      const consumidor = await Consumidor.findByPk(consumidorId);

      const encargadoId = consumidor.encargadoId;

      const puestos = await Puesto.findAll({
        where: {
          encargadoId: encargadoId,
        },
        attributes: ['id'],
      });

      const puestosIds = puestos.map((puesto) => puesto.id);

      const asociaciones = await Asociacion.findAll({
        where: {
          puestoId: puestosIds,
        },
      });

      const eventoIds = asociaciones.map((asociacion) => asociacion.eventoId);

      const eventos = await Evento.findAll({
        where: {
          id: eventoIds,
        },
      });

      return res.status(200).json({
        status: 'success',
        msg: 'Eventos found',
        code: 200,
        data: eventos,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }



}

export const asociacionController = new AsociacionController();
