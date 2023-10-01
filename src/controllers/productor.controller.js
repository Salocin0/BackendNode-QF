import { consumidorService } from '../services/consumidor.service.js';
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
      const id = req.params.id;
      const consumidor = await consumidorService.getOne(id);

      console.log("Este  es el ID: " + consumidor.productorId);

      const { razonSocialPE, cuitPE } = req.body;

      console.log(id, razonSocialPE, cuitPE);

      const result = await productorService.updateOne(consumidor.productorId, { razonSocialPE, cuitPE });

      return res.status(200).json({
        status: 'success',
        msg: 'Productor actualizado correctamente',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Ocurrió un error al actualizar el Productor :(',
        data: {},
      });
    }
  }

  async updateOneControllerHabilitacion(req, res) {
    try {
      const id = req.params.id;
      const consumidor = await consumidorService.getOne(id);
     const idProductor =  consumidor.productorId;
     const idUser = consumidor.usuarioId;
      const result = await productorService.updateOneHabilitacion(idProductor, idUser);
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
      const consumidor = await consumidorService.getOne(id);

      console.log("Este  es el ID: " + consumidor.productorId);

      const result = await productorService.deleteOne(consumidor.productorId, consumidor.usuarioId);

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
}

export const productorController = new ProductorController();
