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
  async getNotificaciones(idConsumidor, dispositivo) {
    const usuario = await userService.getOneByConsumidorId(idConsumidor);
    
    // Ordenar por fecha de manera descendente (más reciente primero)
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: usuario.id, dispositivo: dispositivo },
      order: [['fecha', 'DESC']], // Ordena por el campo fecha en orden descendente
    });
  
    return notificaciones;
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
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'pendiente');
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'pendiente');
    }
  }

  async enviarNotificacionesAUsuario(usuarioId, tituloNotificacion, descripcionNotificacion, tokenUsuarioMobile, tokenUsuarioWeb) {
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      this.crearNotificacion(usuarioId, tituloNotificacion, descripcionNotificacion, 'web', 'visto');
    }else{
      this.crearNotificacion(usuarioId, tituloNotificacion, descripcionNotificacion, 'web', 'pendiente');
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      this.crearNotificacion(usuarioId, tituloNotificacion, descripcionNotificacion, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuarioId, tituloNotificacion, descripcionNotificacion, 'mobile', 'pendiente');
    }
  }

  async enviarNotificacionesAsociacion(eventoId, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorEvento(eventoId);
    const evento = await eventoService.getOne(eventoId);
    const consumidor = await consumidorService.getOneByProductorId(evento.productorId); 
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'pendiente');
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'pendiente');
    }
  }

  async enviarNotificacionesAsociacionAceptaradaRepartidor(Id, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorEvento(Id);
    const evento = await eventoService.getOne(Id);
    const consumidor = await consumidorService.getOneByProductorId(evento.productorId); 
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'pendiente');
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'pendiente');
    }
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
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'pendiente');
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'pendiente');
    }
  }

  async enviarNotificacionesProductorEvento(eventoid, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorEvento(eventoid);
    const productorId = await productorService.getProductorByEvento(eventoid);
    const consumidor = await consumidorService.getOneByRepartidorId(productorId);
    const usuario = await userService.getOneByConsumidorId(consumidor.id);
    const titulo = tituloNotificacion;
    const descripcion = descripcionNotificacion;
    if (tokenUsuarioWeb) {
      await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'web', 'pendiente');
    }
    if (tokenUsuarioMobile) {
      await sendNotificacionesMobile(tokenUsuarioMobile, titulo, descripcion);
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuario.id, tituloNotificacion, descripcionNotificacion, 'mobile', 'pendiente');
    }
  }

  enviarNotificacionesPedidoValorado
  async enviarNotificacionesPedidoValorado(pedidoId, tituloNotificacionEncargado, descripcionNotificacionEncargado, tituloNotificacionRepartidor, descripcionNotificacionRepartidor) {
    const pedido = await pedidoService.getOne(pedidoId);
    const puesto = await puestoService.getOne(pedido.puestoId);
    const encargadoId = await puesto.encargadoId;
    const repartidorId = await pedido.repartidorId;
    const consumidor = await consumidorService.getOneByEncargadoId(encargadoId);
    const usuarioEncargado = await userService.getOneByConsumidorId(consumidor.id);
    const usuarioRepartidor = await userService.getOneByRepartidorId(repartidorId);
    const { tokenUsuarioWeb: tokenUsuarioWebEncargado, tokenUsuarioMobile: tokenUsuarioMobileEncargado } = await this.buscarTokenPorPuesto(puesto.id);
    this.enviarNotificacionesAUsuario(usuarioEncargado.id, tituloNotificacionEncargado, descripcionNotificacionEncargado, tokenUsuarioMobileEncargado, tokenUsuarioWebEncargado);
    const { tokenUsuarioWeb: tokenUsuarioWebRepartidor, tokenUsuarioMobile: tokenUsuarioMobileRepartidor } = getTokenByRepartidorrId(repartidorId);
    this.enviarNotificacionesAUsuario(usuarioRepartidor.id, tituloNotificacionRepartidor, descripcionNotificacionRepartidor, tokenUsuarioMobileRepartidor, tokenUsuarioWebRepartidor);

    if (tokenUsuarioWebEncargado) {
      await sendNotificacionesWeb(tokenUsuarioWebEncargado, tituloNotificacionEncargado, descripcionNotificacionEncargado);
      this.crearNotificacion(usuarioEncargado.id, tituloNotificacionEncargado, descripcionNotificacionEncargado, 'web', 'visto');
    }else{
      this.crearNotificacion(usuarioEncargado.id, tituloNotificacionEncargado, descripcionNotificacionEncargado, 'web', 'pendiente');
    }
    if (tokenUsuarioWebRepartidor) {
      await sendNotificacionesWeb(tokenUsuarioWebRepartidor, tituloNotificacionRepartidor, descripcionNotificacionRepartidor);
      this.crearNotificacion(usuarioRepartidor.id, tituloNotificacionRepartidor, descripcionNotificacionRepartidor, 'web', 'visto');
    }else{
      this.crearNotificacion(usuarioRepartidor.id, tituloNotificacionRepartidor, descripcionNotificacionRepartidor, 'web', 'pendiente');
    }
    if (tokenUsuarioMobileEncargado) {
      await sendNotificacionesMobile(tokenUsuarioMobileEncargado, tituloNotificacionEncargado, descripcionNotificacionEncargado);
      this.crearNotificacion(usuarioEncargado.id, tituloNotificacionEncargado, descripcionNotificacionEncargado, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuarioEncargado.id, tituloNotificacionEncargado, descripcionNotificacionEncargado, 'mobile', 'pendiente');
    }
    if (tokenUsuarioMobileRepartidor) {
      await sendNotificacionesMobile(tokenUsuarioMobileRepartidor, tituloNotificacionRepartidor, descripcionNotificacionRepartidor);
      this.crearNotificacion(usuarioRepartidor.id, tituloNotificacionRepartidor, descripcionNotificacionRepartidor, 'mobile', 'visto');
    }else{
      this.crearNotificacion(usuarioRepartidor.id, tituloNotificacionRepartidor, descripcionNotificacionRepartidor, 'mobile', 'pendiente');
    }
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
