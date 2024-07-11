import { Op } from 'sequelize';
import { notificationTexts } from '../config/notificacionesConfig.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { Producto } from '../DAO/models/producto.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { estadosPedido } from '../estados/estados/estadosPedido.js';
import { notificacionesService } from './notificaciones.service.js';

class PedidoService {
  async getAll(consumidorId) {
    const pedidos = await Pedido.findAll({
      where: {
        consumidorId: consumidorId,
      },
      include: [{ model: Puesto }, { model: DetallePedido, as: 'detalles' }],
    });
    return pedidos;
  }

  async getAllPuesto(consumidorId) {
    const consumidor = await Consumidor.findOne({
      where: {
        id: consumidorId,
      },
    });

    const encargadoId = consumidor.encargadoId;

    const puestos = await Puesto.findAll({
      where: {
        encargadoId: encargadoId,
      },
      attributes: ['id'],
    });

    const idPuestos = puestos.map((puesto) => puesto.id);

    const pedidos = await Pedido.findAll({
      where: {
        puestoid: idPuestos,
      },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
            },
          ],
        },
        { model: Puesto },
      ],
    });

    console.log('Pedidos obtenidos:', pedidos);
    return pedidos;
  }
  catch(error) {
    console.error('Error al obtener pedidos por consumidor:', error);
    throw error;
  }

  async getAllRepartidor(consumidorId) {
    const consumidor = await Consumidor.findOne({
      where: {
        id: consumidorId,
      },
    });

    const repartidorId = consumidor.repartidorId;

    const pedidos = await Pedido.findAll({
      where: {
        repartidorId: repartidorId,
        estado: {
          [Op.or]: ["Asignado"],
        },
      },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
            },
          ],
        },
        { model: Puesto },
      ],
    });

    console.log('Pedidos obtenidos:', pedidos);
    return pedidos;
  }
  catch(error) {
    console.error('Error al obtener pedidos por consumidor:', error);
    throw error;
  }

  async getOne(id) {
    const pedido = await Pedido.findOne({
      where: {
        id: id,
      },
      include: [{ model: Puesto }, { model: DetallePedido, as: 'detalles' }],
    });

    return pedido;
  }

  async getOnePuesto(idPedido) {
    const pedido = await Pedido.findByPk(idPedido);
    if (!pedido) {
      return null;
    }
    return pedido.puestoId;
  }

  async getOneRepartidor(idPedido) {
    const pedido = await Pedido.findByPk(idPedido);
    if (!pedido) {
      return null;
    }
    return pedido.repartidorId;
  }

  async sendNotificaciones(puestoId){
    const tituloNotificacion = notificationTexts.consumidor.titulo;
    const descripcionNotificacion = notificationTexts.consumidor.descripcion;

    console.log(tituloNotificacion,descripcionNotificacion,"dsfasfdasdfasdfdasf");

    const resultadoNotificacion = await notificacionesService.enviarNotificaciones(puestoId, tituloNotificacion,descripcionNotificacion);

    return resultadoNotificacion;
  }


  async create(pedido, detallesPedido) {
    const pedidoCreado = await Pedido.create(pedido);
    
    for (const detallePedido of detallesPedido) {
      detallePedido.PedidoId = pedidoCreado.id;
      await DetallePedido.create(detallePedido);
    }
  }

    async updateState(pedidoId, accion) {
      try {
        const pedido = await this.getOne(pedidoId); 
        const estadoActual = pedido.estado;
  
        console.log(estadoActual);
        console.log(accion)
  
        if (estadosPedido[estadoActual] && estadosPedido[estadoActual][accion]) {
          await estadosPedido[estadoActual][accion](pedido);
          return { success: true, message: 'Estado del pedido actualizado.' };
        } else {
          return { success: false, message: 'No se encontró la acción para el estado actual.' };
        }
      } catch (error) {
        console.error(error);
        throw new Error('Error al cambiar el estado del pedido.');
      }
    }
  
  }


export const pedidoService = new PedidoService();
