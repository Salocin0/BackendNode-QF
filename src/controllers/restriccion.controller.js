import { restriccionService } from '../services/restriccion.service.js';

class RestriccionController {
  async getAllController(req, res) {
    try {
      const consumidorid = req.headers['consumidorid'];
      const restricciones = await restriccionService.getAll(consumidorid);
      if (restricciones) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all restricciones',
          data: restricciones,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'restricciones not found',
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
      const restricciones = await restriccionService.getAllInEvent(id);
      if (restricciones) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all restricciones',
          data: restricciones,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'restricciones not found',
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
      const restriccion = await productoService.getOne(Id);
      if (restriccion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'restriccion found',
          data: restriccion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'restriccion with id ' + req.params.id + ' not found',
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
      const { titulo, tipo, opciones, usuario, consumidorId, eventoId } = req.body;
      const nuevaRestriccion = {
        titulo: titulo,
        tipo: tipo,
        opciones: opciones,
        usuario: usuario,
        consumidorId: consumidorId,
        eventoId: eventoId,
      };

      const restricionCreado = await restriccionService.create(nuevaRestriccion);

      return res.status(200).json({
        status: 'success',
        msg: 'Restriccion created',
        code: 200,
        data: restricionCreado,
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

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const restriccion = await restriccionService.delete(id);
      if (restriccion) {
        return res.status(200).json({
          status: 'success',
          msg: 'restriccion deleted',
          code: 200,
          data: restriccion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'restriccion not found',
          code: 404,
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }
}

export const restriccionController = new RestriccionController();
