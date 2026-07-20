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
import { Evento } from '../DAO/models/evento.model.js';
import { Productor } from '../DAO/models/Productor.model.js';

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
            include: [
              {
                model: Usuario,
              }
            ]
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

    console.log('Pedidos obtenidos:', pedidos.length);
    return pedidos;
  }

  async getAllPedidosOnePuesto(idPuesto) {
    const pedidos = await Pedido.findAll({
      where: {
        puestoId: idPuesto,
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
        {
          model: Consumidor,
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['usuario'],
            },
          ],
          attributes: ['nombre', 'apellido'],
        },
      ],
    });

    console.log('Pedidos obtenidos:', pedidos.length);
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
          [Op.or]: ["EnCamino", "Entregado"],
        },
      },
      include: includeModels,
    });
    
    console.log('Pedidos obtenidos:', pedidos.length);
    return pedidos;    
  }

  async getOne(id) {
    const pedido = await Pedido.findOne({
      where: {
        id: id,
      },
      include: [
        { model: Puesto },
        { 
          model: DetallePedido, 
          as: 'detalles',
          include: [
            { model: Producto, as: 'producto' }
          ]
        },
        {
          model: Consumidor,
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['usuario', 'email', 'tokenWeb', 'tokenMobile'],
            },
          ],
          // 'email' is stored in the associated Usuario model, not in Consumidor
          attributes: ['nombre', 'apellido', 'telefono'],
        },
        {
          model: Repartidor,
          include: [
            {
              model: Consumidor,
              include: [
                {
                  model: Usuario,
                  as: 'usuario',
                  attributes: ['usuario', 'email'],
                },
              ],
              attributes: ['nombre', 'apellido', 'telefono'],
            },
          ],
        },
        {
          model: Evento,
          include: [
            {
              model: Productor,
            },
          ],
        },
      ],
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

  async getAllEvento(idEvento) {
    const pedidos = await Pedido.findAll({
      where: {
        eventoId: idEvento,
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

    console.log('Pedidos obtenidos:', pedidos.length);
    return pedidos;
  }

  async sendNotificacionesPedidoCreado(puestoId,consumidorId){
    //notificacion al encargado
    const tituloNotificacion = notificationTexts.encargado.tituloNuevoPedido;
    const descripcionNotificacion = notificationTexts.encargado.descripcionNuevoPedido;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion);
    //notificacion al consumidor
    const tituloNotificacionConsumidor = notificationTexts.consumidor.tituloPedidoCreado;
    const descripcionNotificacionConsumidor = notificationTexts.consumidor.descripcionPedidoCreado;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacionConsumidor = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacionConsumidor, descripcionNotificacionConsumidor,user.tokenMobile, user.tokenWeb);
    
    return resultadoNotificacion;
  }

  async sendNotificacionesPedidoAceptado(consumidorId){
    const tituloNotificacion = notificationTexts.consumidor.tituloPedidoAceptado;
    const descripcionNotificacion = notificationTexts.consumidor.descripcionPedidoAceptado;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacion, descripcionNotificacion,user.tokenMobile, user.tokenWeb);
    return resultadoNotificacion;
  }

  async sendNotificacionesPedidoCancelado(puestoId,consumidorId){
    let tituloNotificacion = notificationTexts.encargado.tituloPedidoCancelado;
    let descripcionNotificacion = notificationTexts.encargado.descripcionPedidoCancelado;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion);
    tituloNotificacion = notificationTexts.consumidor.tituloPedidoCancelado;
    descripcionNotificacion = notificationTexts.consumidor.descripcionPedidoCancelado;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacion2 = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacion, descripcionNotificacion,user.tokenMobile, user.tokenWeb);
    return resultadoNotificacion;
  }

  async sendNotificacionesPedidoEnCamino(consumidorId){
    const tituloNotificacion = notificationTexts.consumidor.tituloPedidoEnCamino;
    const descripcionNotificacion = notificationTexts.consumidor.descripcionPedidoEnCamino;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacion, descripcionNotificacion,user.tokenMobile, user.tokenWeb);
    return resultadoNotificacion;
  }

  async sendNotificacionesPedidoEntregado(consumidorId){
    const tituloNotificacion = notificationTexts.consumidor.tituloPedidoEntregado;
    const descripcionNotificacion = notificationTexts.consumidor.descripcionPedidoEntregado;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacion, descripcionNotificacion,user.tokenMobile, user.tokenWeb);
    return resultadoNotificacion;
  }

  async sendNotificacionesPedidoPreparado(consumidorId){
    const tituloNotificacion = notificationTexts.consumidor.tituloPedidoPreparando;
    const descripcionNotificacion = notificationTexts.consumidor.descripcionPedidoPreparando;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacion, descripcionNotificacion,user.tokenMobile, user.tokenWeb);
    return resultadoNotificacion;
  }

  async sendNotificacionesPedidoValorado(consumidorId){
    const tituloNotificacionEncargado = notificationTexts.encargado.tituloPedidoValorado;
    const descripcionNotificacionEncargado = notificationTexts.encargado.descripcionPedidoValorado;
    const tituloNotificacionRepartidor = notificationTexts.repartidor.tituloPedidoValorado;
    const descripcionNotificacionRepartidor = notificationTexts.repartidor.descripcionPedidoValorado;
    const user = await Usuario.findOne({where: {id: consumidorId}});
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAUsuario(user.id, tituloNotificacionRepartidor, descripcionNotificacionRepartidor,user.tokenMobile, user.tokenWeb);
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

      pedido.repartidorId = idRepartidor;
      // Forzar que el código de entrega tenga como máximo 6 caracteres
      pedido.codigoEntrega = String(codigo).toUpperCase().slice(0, 6);
      pedido.puntoEncuentroId = Number(idPE.id);

      await pedido.save();
      console.log(`Pedido ${pedido.id} actualizado con repartidorId=${idRepartidor}`);
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

      if (estadosPedido[estadoActual] && estadosPedido[estadoActual][accion]) {
        await estadosPedido[estadoActual][accion](pedido);
        if(accion === 'aceptar'){
          const puestoId = pedido.puestoId;
          const pedidoNotificaciones = await this.sendNotificacionesPedidoAceptado(puestoId);
        }
        if(accion === 'preparar'){
          const puestoId = pedido.puestoId;
          const pedidoNotificaciones = await this.sendNotificacionesPedidoPreparado(puestoId);
        }
        if(accion === 'enCamino'){
          const puestoId = pedido.puestoId;
          const pedidoNotificaciones = await this.sendNotificacionesPedidoEnCamino(puestoId);
        }
        if(accion === 'cancelar'){
          const puestoId = pedido.puestoId;
          const pedidoNotificaciones = await this.sendNotificacionesPedidoCancelado(puestoId);
        }
        if(accion === 'pedidoEntregado'){
          const puestoId = pedido.puestoId;
          const pedidoNotificaciones = await this.sendNotificacionesPedidoEntregado(puestoId);
          pedido.fechaEntrega = Date.now();
          pedido.save();
        }
        if(accion === "valorar"){
          const id = pedido.id;
          const pedidoNotificaciones = await pedidoService.sendNotificacionesPedidoValorado(id);
        }
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
