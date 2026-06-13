import { sendNotificacionesMobile } from '../../dist/util/NotificacionesMobile.js';
import { userController } from '../controllers/users.controller.js';
import { sendNotificacionesWeb } from '../util/Notificaciones.js';
import { asociacionService } from './asociacion.service.js';
import { productorService } from './productor.service.js';
import { puestoService } from './puesto.service.js';
import { Notificacion } from '../DAO/models/notificaciones.model.js';
import { userService } from './users.service.js';
import { consumidorService } from './consumidor.service.js';
import { eventoService } from './evento.service.js';
import { pedidoService } from './pedido.service.js';
import { repartidorService } from './repartidor.service.js';
import { notificationTexts } from '../config/notificacionesConfig.js';

class NotificacionesService {
  async getNotificaciones(idConsumidor) {
    const usuario = await userService.getOneByConsumidorId(idConsumidor);
    
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: usuario.id },
      order: [['fecha', 'DESC']],
    });
  
    // Deduplicar: cuando se creaban notificaciones por separado para web y mobile
    // se generaban dos registros iguales. Nos quedamos con el primero de cada grupo.
    const seen = new Set();
    const deduplicadas = notificaciones.filter(n => {
      const fecha = new Date(n.fecha);
      const key = `${n.titulo}|${n.descripcion}|${fecha.toISOString().slice(0, 16)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  
    return deduplicadas;
  }
  

  async CambiarNotificacionAVista(id) {
    const notificacion = await Notificacion.findByPk(id);
    notificacion.estado = 'visto';
    await notificacion.save();
    return notificacion;
  }

  async crearNotificacion(usuarioId, tituloNotificacion, descripcionNotificacion,dispositivo,estado) {
    const notificacion = await Notificacion.create({
      usuarioId: usuarioId,
      titulo: tituloNotificacion,
      descripcion: descripcionNotificacion,
      estado: estado,
      dispositivo: dispositivo
    });
    return notificacion;
  }

  
  async enviarNotificacionesPrecompra(eventoId) {
    const pedidos = await pedidoService.getAllEvento(eventoId);
    for (const pedido of pedidos) {
      const consumidorid = pedido.consumidorId;
      const usuario = await userService.getOneByConsumidorId(consumidorid);
      userController.getTokenByEncargadoId
      const tokenUsuarioMobile = usuario.tokenWeb;
      const tokenUsuarioWeb = usuario.tokenMobile;
      const tituloNotificacion = notificationTexts.consumidor.tituloEventoIniciado;
      const descripcionNotificacion = notificationTexts.consumidor.descripcionEventoIniciado;
      this.enviarNotificacionesAUsuario(usuario.id, tituloNotificacion, descripcionNotificacion, tokenUsuarioMobile, tokenUsuarioWeb)
    }
  }

  async enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorPuesto(puestoId);
    const encargadoid = await puestoService.getEncargadoIdByPuestoId(puestoId);
    const consumidor = await consumidorService.getOneByEncargadoId(encargadoid); 
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    let estadoNotif = 'pendiente';
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      estadoNotif = 'visto';
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      estadoNotif = 'visto';
    }
    await this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'todos', estadoNotif);
  }

  async enviarNotificacionesAUsuario(usuarioId, tituloNotificacion, descripcionNotificacion, tokenUsuarioMobile, tokenUsuarioWeb) {
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    let estadoNotif = 'pendiente';
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      estadoNotif = 'visto';
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      estadoNotif = 'visto';
    }
    await this.crearNotificacion(usuarioId, tituloNotificacion, descripcionNotificacion, 'todos', estadoNotif);
  }

  async _enviarConUnificacion(usuario, tituloNotificacion, descripcionNotificacion, tokenWeb, tokenMobile) {
    let estadoNotif = 'pendiente';
    if (tokenWeb) {
      await sendNotificacionesWeb(tokenWeb, tituloNotificacion, descripcionNotificacion);
      estadoNotif = 'visto';
    }
    if (tokenMobile) {
      await sendNotificacionesMobile(tokenMobile, tituloNotificacion, descripcionNotificacion);
      estadoNotif = 'visto';
    }
    await this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'todos', estadoNotif);
  }

  async enviarNotificacionesAsociacion(eventoId, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorEvento(eventoId);
    const evento = await eventoService.getOne(eventoId);
    const consumidor = await consumidorService.getOneByProductorId(evento.productorId); 
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    await this._enviarConUnificacion(usuario, tituloNotificacion, descripcionNotificacion, tokenUsuarioWeb, tokenUsuarioMobile);
  }

  async enviarNotificacionesAsociacionAceptaradaRepartidor(Id, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorEvento(Id);
    const evento = await eventoService.getOne(Id);
    const consumidor = await consumidorService.getOneByProductorId(evento.productorId); 
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    await this._enviarConUnificacion(usuario, tituloNotificacion, descripcionNotificacion, tokenUsuarioWeb, tokenUsuarioMobile);
  }

  async enviarNotificacionesAsociacionAPartirAsociacion(Id, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorAsociacion(Id);
    const asociacion = await asociacionService.getOne(Id);
    let consumidor = null;
    if(asociacion.repartidoreId){
      const repartidor = await repartidorService.getOne(asociacion.repartidoreId);
      consumidor = await consumidorService.getOneByRepartidorId(repartidor.id);
    }else{
      const puesto = await puestoService.getOne(asociacion.puestoId);
      consumidor = await consumidorService.getOneByEncargadoId(puesto.encargadoId);
    }
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    await this._enviarConUnificacion(usuario, tituloNotificacion, descripcionNotificacion, tokenUsuarioWeb, tokenUsuarioMobile);
  }

  async enviarNotificacionesProductorEvento(eventoid, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorEvento(eventoid);
    const productorId = await productorService.getProductorByEvento(eventoid);
    const consumidor = await consumidorService.getOneByRepartidorId(productorId);
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    await this._enviarConUnificacion(usuario, tituloNotificacion, descripcionNotificacion, tokenUsuarioWeb, tokenUsuarioMobile);
  }

  async enviarNotificacionesPedidoValorado(pedidoId, tituloNotificacionEncargado, descripcionNotificacionEncargado, tituloNotificacionRepartidor, descripcionNotificacionRepartidor) {
    const pedido = await pedidoService.getOne(pedidoId);
    const puesto = await puestoService.getOne(pedido.puestoId);
    const encargadoId = await puesto.encargadoId;
    const repartidorId = await pedido.repartidorId;
    const consumidor = await consumidorService.getOneByEncargadoId(encargadoId);
    const usuarioEncargado = await userService.getOneByConsumidorId(consumidor.id);
    const { tokenUsuarioWeb: tokenUsuarioWebEncargado, tokenUsuarioMobile: tokenUsuarioMobileEncargado } = await this.buscarTokenPorPuesto(puesto.id);
    await this._enviarConUnificacion(usuarioEncargado, tituloNotificacionEncargado, descripcionNotificacionEncargado, tokenUsuarioWebEncargado, tokenUsuarioMobileEncargado);

    const usuarioRepartidor = await userService.getOneByRepartidorId(repartidorId);
    const { tokenUsuarioWeb: tokenUsuarioWebRepartidor, tokenUsuarioMobile: tokenUsuarioMobileRepartidor } = getTokenByRepartidorrId(repartidorId) || {};
    await this._enviarConUnificacion(usuarioRepartidor, tituloNotificacionRepartidor, descripcionNotificacionRepartidor, tokenUsuarioWebRepartidor, tokenUsuarioMobileRepartidor);
  }

  async buscarTokenPorPuesto(puestoId) {
    const encargadoId = await puestoService.getEncargadoIdByPuestoId(puestoId);
    const tokens = await userController.getTokenByEncargadoId(encargadoId);
    return tokens;
  }

  async buscarTokenPorEvento(eventoId) {
    const productorId = await productorService.getProductorByEvento(eventoId);
    const tokens = await userController.getTokenByProductorId(productorId);
    return tokens;
  }

  async buscarTokenPorAsociacion(Id) {
    const asociacion = await asociacionService.getOne(Id);
    const repartidorId = await asociacion.repartidoreId;
    const puestoId = await asociacion.puestoId;
    if (repartidorId) {
      const tokens = await userController.getTokenByRepartidorrId(repartidorId);
      return tokens;
    } else {
      const tokens = await userController.getTokenByPuestoId(puestoId);
      return tokens;
    }
  }
  sendNotificacionesAsociacionCreada
}

export const notificacionesService = new NotificacionesService();
