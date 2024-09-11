import { Op } from 'sequelize';
import { notificationTexts } from '../config/notificacionesConfig.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { DetallePedido } from '../DAO/models/detallePedido.model.js';
import { Pedido } from '../DAO/models/pedido.model.js';
import { Producto } from '../DAO/models/producto.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { estadosPedido } from '../estados/estados/estadosPedido.js';
import { notificacionesService } from './notificaciones.service.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { PuntoEncuentro } from '../DAO/models/puntoEncuentro.model.js';
import Sequelize from 'sequelize';
import { Usuario } from '../DAO/models/users.model.js';

class PedidoService {
  async getAll(consumidorId) {
    const whereConditions = { consumidorId };
    const includeModels = [
      { model: Puesto },
      {
        model: DetallePedido,
        as: 'detalles',
        include: [
          {
            model: Producto,
            as: 'producto'
          }
        ]
      }
    ];
  
    if (await Pedido.findOne({ where: { consumidorId, repartidorId: { [Op.ne]: null } } })) {
      includeModels.push({
        model: Repartidor,
        include: [
          {
            model: Consumidor,
          }
        ]
      });
    }
  
    if (await Pedido.findOne({ where: { consumidorId, puntoEncuentroId: { [Op.ne]: null } } })) {
      includeModels.push({
        model: PuntoEncuentro,
      });
    }
  
    const pedidos = await Pedido.findAll({
      where: whereConditions,
      include: includeModels,
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
        puestoId: idPuestos,
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
  
  async getAllRepartidor(consumidorId) {
    const consumidor = await Consumidor.findOne({
      where: {
        id: consumidorId,
      },
    });

    const repartidorId = consumidor.repartidorId;

    const includeModels = [
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
      { model: Consumidor, include: [{ model: Usuario, as: 'usuario' }] }, // Include Usuario relation here
      {
        model: Repartidor,
        include: [
          {
            model: Consumidor,
            include: [{ model: Usuario, as: 'usuario' }], // Include Usuario for Repartidor's Consumidor
          },
        ],
      },
    ];
    
    if (await Pedido.findOne({ where: { repartidorId, puntoEncuentroId: { [Op.ne]: null } } })) {
      includeModels.push({
        model: PuntoEncuentro,
      });
    }
    
    const pedidos = await Pedido.findAll({
      where: {
        repartidorId: repartidorId,
        estado: {
          [Op.or]: ["EnCamino"],
        },
      },
      include: includeModels,
    });
    
    console.log('Pedidos obtenidos:', pedidos);
    return pedidos;    
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

  async sendNotificacionesWeb(puestoId){
    const tituloNotificacion = notificationTexts.consumidor.titulo;
    const descripcionNotificacion = notificationTexts.consumidor.descripcion;

    console.log(tituloNotificacion, descripcionNotificacion, "dsfasfdasdfasdfdasf");

    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion);

    return resultadoNotificacion;
  }

  async create(pedido, detallesPedido) {
    const pedidoCreado = await Pedido.create(pedido);
    
    for (const detallePedido of detallesPedido) {
      detallePedido.PedidoId = pedidoCreado.id;
      await DetallePedido.create(detallePedido);
    }
  }

  async setDatosExtraPedido(idpedido, idRepartidor, codigo, idPE) {
    try {
      let pedido = await this.getOne(idpedido);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }
  
      // Verifica que el objeto pedido se actualice correctamente
      console.log('pedido antes de actualizar:', pedido);
  
      pedido.repartidorId = idRepartidor;
      pedido.codigoEntrega = codigo;
      pedido.puntoEncuentroId = Number(idPE.id);
  
      // Verifica que los cambios se reflejen en el objeto pedido
      console.log('pedido después de actualizar:', pedido);
  
      await pedido.save();
      console.log('Pedido guardado exitosamente');
      return pedido;
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
      throw error;
    }
  }
  

  async updateState(pedidoId, accion) {
    try {
      const pedido = await this.getOne(pedidoId); 
      const estadoActual = pedido.estado;

      console.log(estadoActual);
      console.log(accion);

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
