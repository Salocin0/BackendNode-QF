import { puestoService } from '../services/puesto.service.js';

class PuestoController {
  async getAllController(req, res) {
    try {
      const consumidorId = req.headers["consumidorid"];
      console.log(consumidorId)
      const puestos = await puestoService.getAll(consumidorId);
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
      console.log(puesto)
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
      const { nombreCarro, numeroCarro, tipoNegocio, telefonoContacto, razonSocial, cuit, telefonoCarro ,consumidorId } = req.body;
      const nuevoPuesto = {
        nombreCarro: nombreCarro,
        numeroCarro: numeroCarro,
        tipoNegocio: tipoNegocio,
        telefonoContacto: telefonoContacto,
        razonSocial: razonSocial,
        cuit: cuit,
        telefonoCarro: telefonoCarro,
        consumidorId:consumidorId
      };
      console.log(nuevoPuesto);
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