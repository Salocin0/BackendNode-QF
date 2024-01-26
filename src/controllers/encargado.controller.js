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

  async getOnecontroller(req, res) {
    try {
      const encargadoId = req.params.id;
      const encargado = await encargadoService.getOne(encargadoId);
      if (encargado !== null) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'user found',
          data: encargado,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'user with id ' + req.params.id + ' not found',
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
      const { razonSocialEPC, cuitEPC } = req.body;
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

  async updateOneControllerHabilitacion(req, res) {
    try {
      const id = req.params.id;
      const consumidor = await consumidorService.getOne(id);
      const idEncargado = consumidor.encargadoId;
      const idUser = consumidor.usuarioId;
      const result = await encargadoService.updateOneHabilitacion(idEncargado, idUser);
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
      console.error(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        data: {},
      });
    }
  }

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const consumidor = await consumidorService.getOne(id);
      const result = await encargadoService.deleteOne(consumidor.encargadoId, consumidor.usuarioId);
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

  async createOneController(req, res) {
    try {
      const { encargado } = req.body;
      const nuevoEncargado = {
        cuit: encargado.cuit,
        razonSocial: encargado.razonSocial,
      };
      const encargadoendb = await encargadoService.getOneByRazonSocial(nuevoEncargado.razonSocial);
      if (encargadoendb) {
        return res.status(200).json({
          status: 'error',
          msg: 'encargado used',
          code: 400,
          data: {},
        });
      } else {
        const encargadoCreado = await encargadoService.create(nuevoEncargado);
        return res.status(201).json({
          status: 'success',
          msg: 'encargado created',
          code: 200,
          data: encargadoCreado,
        });
      }
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

export const encargadoController = new EncargadoController();
