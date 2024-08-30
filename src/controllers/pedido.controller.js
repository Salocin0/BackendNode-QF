import { estadosPedido } from '../estados/estados/estadosPedido.js';
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
      const pedidos = await pedidoService.getAllRepartidor(consumidorId);
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
      const { detalles, consumidorId, total, puestoId,fecha,precompra } = req.body;
      var nuevoPedido = {
        fecha: Date.now(),
        consumidorId: consumidorId,
        total: total,
        estado: 'Pendiente',
        puestoId: puestoId,
        fechaPreCompra: fecha
      };
      if(precompra){
        nuevoPedido.estado="Precomprado"
      }
      
      const pedidoCreado = await pedidoService.create(nuevoPedido, detalles);
      if (pedidoCreado === false) {
        return res.status(400).json({
          status: 'error',
          msg: 'Producto used',
          code: 400,
          data: {},
        });
      } else {
        //llamar al pedidoService(puestoId) (SERVICE CON SERVICE)
        const pedidoNotificaciones = await pedidoService.sendNotificacionesWeb(puestoId);



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

  async updateStateController(req, res) {
    const pedidoId = req.params.id;
    let accion = req.params.accion; // Usar 'let' en lugar de 'const' porque se puede cambiar

    try {
      // Obtener el pedido con el ID proporcionado
      const pedido = await pedidoService.getOne(pedidoId);

      // Obtener el estado actual del pedido
      const estadoActual = pedido.estado;

      console.log("Estado actual:", estadoActual);
      console.log("Acción recibida:", accion);

      // Cambiar el valor de 'accion' si es necesario
      if (accion === 'Aceptado') {
        accion = 'aceptar';
      } if (accion === 'En Preparación') {
        accion = 'preparar';
      } if (accion === 'En Camino'){
        accion = 'enCamino';
      } if (accion === 'Cancelado'){
        accion = 'cancelar';
      }

      console.log("ACA:", accion); // Asegúrate de que 'accion' tiene el valor esperado

      // Verificar si el estado y la acción existen en 'estadosPedido'
      if (estadosPedido[estadoActual] && estadosPedido[estadoActual][accion]) {
        await estadosPedido[estadoActual][accion](pedido);
        res.status(200).json({ message: 'Estado del evento actualizado.' });

        // Aquí debes asegurarte de que 'userid' esté definido y se pase correctamente
      } else {
        res.status(400).json({ message: 'No se encontró la acción para el estado actual.' });
      }
    } catch (error) {
      console.error("Error al cambiar el estado del evento:", error);
      res.status(500).json({ message: 'Error al cambiar el estado del evento.' });
    }
  }
}
export const pedidoController = new PedidoController();
