import { puestoService } from '../services/puesto.service.js';

class PuestoController {
  async getAllController(req, res) {
    try {
      const userid= req.user
      console.log(userid)
      const puestos = await puestoService.getAll(userid);
      if (puestos.length > 0) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all puestos',
          data: puestos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'puestos not found',
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
      const puestoId = req.params.id;
      const puesto = await puestoService.getOne(puestoId);
      if (puesto !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'puesto found',
          data: puesto,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'puesto with id ' + req.params.id + ' not found',
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
      const { puesto } = req.body;
      const result = await puestoService.update(id, puesto);    
      return res.status(200).json({
        status: 'success',
        msg: 'puesto is updated',
        code: 200,
        data: result,
      });
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
      const { puesto } = req.body;
      const nuevoPuesto = {
        nombre: puesto.nombre,
        fechaBromatologica: puesto.fechaBromatologica,
        descripcion: puesto.descripcion,
      };
      const puestoCreado = await puestoService.create(nuevoPuesto);
      if (puestoCreado === false) {
        return res.status(200).json({
          status: 'error',
          msg: 'encargado used',
          code: 400,
          data: {},
        });
      } else {
        return res.status(201).json({
          status: 'success',
          msg: 'encargado created',
          code: 200,
          data: puestoCreado,
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

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const puesto = await puestoService.delete(id);
      return res.status(200).json({
        status: 'success',
        msg: 'encargado deleted',
        code: 200,
        data: puesto,
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

export const puestoController = new PuestoController();