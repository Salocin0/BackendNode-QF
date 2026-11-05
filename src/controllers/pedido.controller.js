import { estadosPedido } from '../estados/estados/estadosPedido.js';
import { pedidoService } from '../services/pedido.service.js';
import { puestoService } from '../services/puesto.service.js';
import { eventoService } from '../services/evento.service.js';
import { productoService } from '../services/producto.service.js';
import { createPedidoHandler } from './pedidoCreate.handler.js';
import { createUpdateStateHandler } from './pedidoUpdateState.handler.js';

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

  async getAllPedidosOnePuestoController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const idPuesto = req.params.id;
      const pedidos = await pedidoService.getAllPedidosOnePuesto(idPuesto);
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

  async getAllPuestoController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const pedidos = await pedidoService.getAllPuesto(consumidorId);
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

  async getAllRepartidorController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const pedidos = await pedidoService.getAllRepartidor(consumidorId, { incluirHistorial: req.query?.historial === 'true' });
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

  // Creation logic lives in its own module so it can be tested with stubbed services.
  createOneController = createPedidoHandler({
    get pedidoService() {
      return pedidoService;
    },
    get eventoService() {
      return eventoService;
    },
    get productoService() {
      return productoService;
    },
  });

  updateStateController = createUpdateStateHandler({
    get pedidoService() {
      return pedidoService;
    },
    get estadosPedido() {
      return estadosPedido;
    },
  });
}
export const pedidoController = new PedidoController();
