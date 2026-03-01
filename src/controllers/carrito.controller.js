import { carritoService } from '../services/carrito.service.js';

class CarritoController {
  async getController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      
      if (!consumidorId) {
        return res.status(400).json({
          status: 'error',
          msg: 'ConsumidorId no proporcionado en headers',
          data: {},
        });
      }
      
      const carrito = await carritoService.getOneByConsumidorId(consumidorId);
      return res.status(200).json({
        status: 'success',
        msg: 'Carrito found',
        data: carrito,
      });
    } catch (e) {
      console.error('Error en getController:', e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async deleteOneController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      
      if (!consumidorId) {
        return res.status(400).json({
          status: 'error',
          msg: 'ConsumidorId no proporcionado en headers',
          data: {},
        });
      }
      
      const carrito = await carritoService.delete(consumidorId);
      return res.status(200).json({
        status: 'success',
        msg: 'carrito eliminado',
        code: 200,
        data: carrito,
      });
    } catch (e) {
      console.error('Error en deleteOneController:', e);
      return res.status(500).json({
        status: 'error',
        msg: 'Ocurrió un error al eliminar el carrito :(',
        data: {},
      });
    }
  }

  async addToCartController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      
      if (!consumidorId) {
        return res.status(400).json({
          status: 'error',
          msg: 'ConsumidorId no proporcionado en headers',
          data: {},
        });
      }
      
      const carrito = await carritoService.getOneByConsumidorId(consumidorId);
      if (!carrito) {
        return res.status(404).json({
          status: 'error',
          msg: 'Carrito no encontrado',
          data: {},
        });
      }
      
      const productoId = req.params.productoId;
      const fecha = req.body.fecha;
      const eventoId = req.body.eventoId;
      let cantidad = req.body.cantidad;
      if(!cantidad){
        cantidad = 1;
      }
      await carritoService.addProductToCart(carrito.id, productoId, eventoId,cantidad,fecha);

      const data = await carritoService.getOneByConsumidorId(consumidorId);

      return res.status(200).json({
        status: 'success',
        msg: 'producto agregado al carrito',
        code: 200,
        data: data,
      });
    } catch (e) {
      console.error('Error en addToCartController:', e);
      return res.status(500).json({
        status: 'error',
        msg: 'Ocurrió un error al agregar producto al carrito :(',
        data: {},
      });
    }
  }

  async removeToCartController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const productoId = req.params.productoId;
      const carrito = await carritoService.getOneByConsumidorId(consumidorId);
      const carritoId = carrito.id;
      const fecha = req.body.fecha;
      const eventoId = req.body.eventoId;
      let cantidad = req.body.cantidad;
      if(!cantidad){
        cantidad=1
      }
      const data = await carritoService.removeProductFromCart(carritoId, productoId, cantidad, eventoId,fecha);

      return res.status(200).json({
        status: 'success',
        msg: 'producto eliminado del carrito',
        code: 200,
        data: data,
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

  async deletoToCartController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const productoId = req.params.productoId;
      const carrito = await carritoService.getOneByConsumidorId(consumidorId);
      const carritoId = carrito.id;
      const fecha = req.body.fecha;
      const eventoId = req.body.eventoId;
      const data = await carritoService.revomeAllProductFromCart(carritoId, productoId, eventoId,fecha);

      return res.status(200).json({
        status: 'success',
        msg: 'todas las unidades del producto eliminadas del carrito',
        code: 200,
        data: data,
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

  async deleteProductsToCartController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const puestoId = req.params.puestoId;
      console.log(req.body)
      const fecha = req.body.fecha;
      const carrito = await carritoService.getOneByConsumidorId(consumidorId);
      const carritoId = carrito.id;
      const data = await carritoService.deleteByPuesto(carritoId,puestoId,fecha);

      return res.status(200).json({
        status: 'success',
        msg: 'todas las unidades del producto eliminadas del carrito',
        code: 200,
        data: data,
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

export const carritoController = new CarritoController();
