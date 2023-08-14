import { productorService } from '../services/productor.service.js';

class ProductorController {
  async getAllController(req, res) {
    try {
      const productores = await productorService.getAll();
      if (productores.length > 0) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all productores',
          data: productores,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'Productores not found',
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
      const productorId = req.params.id;
      const productor = await productorService.getOne(productorId);
      if (productor !== null) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Productor found',
          data: productor,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'Productor with id ' + req.params.id + ' not found',
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
      const { id } = req.params;
      const { razonSocial, cuit } = req.body;
      const productor = await productorService.updateOne(id, razonSocial, cuit);
      return res.status(200).json({
        status: 'success',
        msg: 'encargado is updated',
        code: 200,
        data: productor,
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
      const { productor } = req.body;
      const nuevoProductor = {
        cuit: productor.cuit,
        razonSocial: productor.razonSocial,
      };
      const productorCreado = await productorService.create(nuevoProductor);
      if (productorCreado === false) {
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
          data: productorCreado,
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
      const productor = await productorService.deleteOne(id);
      return res.status(200).json({
        status: 'success',
        msg: 'encargado deleted',
        code: 200,
        data: productor,
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

export const productorController = new ProductorController();
