import { asignacionService, AsignacionError } from "../services/asignacion.service.js";

class AsignacionController {
  async getOneController(req, res) {
    try {
      const consumidorid = req.headers['consumidorid'];
      const asignacion = await asignacionService.getOne(consumidorid);
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

  // Shared by the legacy GET routes (mobile app, no courier header) and the strict POST routes.
  respond(action, { strict }) {
    return async (req, res) => {
      try {
        const consumidorId = strict ? req.headers['consumidorid'] : null;
        if (strict && !consumidorId) {
          return res.status(400).json({ status: 'error', msg: 'Consumidor inválido', data: {} });
        }
        const asignacion = await asignacionService[action](req.params.id, consumidorId);
        return res.status(200).json({ status: 'success', msg: `asignacion ${asignacion.estado}`, data: asignacion });
      } catch (e) {
        if (e instanceof AsignacionError) {
          return res.status(e.status).json({ status: 'error', msg: e.message, data: {} });
        }
        console.log(e);
        return res.status(500).json({ status: 'error', msg: 'something went wrong :(', data: {} });
      }
    };
  }

  rechazarController = this.respond('rechazar', { strict: false });
  aceptarController = this.respond('aceptar', { strict: false });
  rechazarStrictController = this.respond('rechazar', { strict: true });
  aceptarStrictController = this.respond('aceptar', { strict: true });
}

export const asignacionController = new AsignacionController();
