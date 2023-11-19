import { pedidoService } from '../services/pedido.service.js';

class PedidoController {
  async getAllController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const pedidos = await pedidoService.getAll(consumidorId);
      if (pedidos) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all pedidos',
          data: pedidos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'pedidos not found',
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
      const pedidoId = req.params.id;
      const pedido = await pedidoService.getOne(pedidoId);
      if (pedido !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'pedido found',
          data: pedido,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'pedido with id ' + req.params.id + ' not found',
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
      const { detalles, consumidorId,total,puestoId } = req.body;
      const nuevoPedido = {
        fecha: Date.now(),
        consumidorId: consumidorId,
        total:total,
        estado: "pendiente",
        puestoId:puestoId
      };

      const pedidoCreado = await pedidoService.create(nuevoPedido, detalles);
      if (pedidoCreado === false) {
        return res.status(400).json({
          status: 'error',
          msg: 'Producto used',
          code: 400,
          data: {},
        });
      } else {
        return res.status(200).json({
          status: 'success',
          msg: 'Producto created',
          code: 200,
          data: pedidoCreado,
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

export const pedidoController = new PedidoController();
