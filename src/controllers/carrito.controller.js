import { carritoService } from '../services/carrito.service.js';

class CarritoController {
  async getController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const carrito = await carritoService.getOne(consumidorId);
      return res.status(200).json({
        status: 'sucess',
        msg: 'Productor found',
        data: carrito,
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

  async deleteOneController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const carrito = await carritoService.delete(consumidorId);
      return res.status(200).json({
        status: 'success',
        msg: 'carrito eliminado',
        code: 200,
        data: carrito,
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

  async addToCartController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const productoId = req.params.productoId;
      const carrito = await carritoService.addToCart(consumidorId,productoId);

      return res.status(200).json({
        status: 'success',
        msg: 'producto agregado al carrito',
        code: 200,
        data: carrito,
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

  async removeToCartController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const productoId = req.params.productoId;
      const carrito = await carritoService.removeToCart(consumidorId,productoId);

      return res.status(200).json({
        status: 'success',
        msg: 'producto eliminado del carrito',
        code: 200,
        data: carrito,
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
      const carrito = await carritoService.deletoToCart(consumidorId,productoId);

      return res.status(200).json({
        status: 'success',
        msg: 'todas las unidades del producto eliminadas del carrito',
        code: 200,
        data: carrito,
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
