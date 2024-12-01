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

class NotificacionesService {
  async getNotificaciones(idConsumidor) {
    const usuario = await userService.getOneByConsumidorId(idConsumidor);
    
    // Ordenar por fecha de manera descendente (más reciente primero)
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: usuario.id },
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
  async enviarNotificacionesAsociacionAceptaradaRepartidorAPartirAsociacion(Id, tituloNotificacion, descripcionNotificacion) {
    const { tokenUsuarioWeb, tokenUsuarioMobile } = await this.buscarTokenPorAsociacion(Id);
    const asociacion = await asociacionService.getOne(Id);
    const repartidor = await repartidorService.getOne(asociacion.repartidoreId);
    const consumidor = await consumidorService.getOneByRepartidorId(repartidor.productorId);
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
}

export const notificacionesService = new NotificacionesService();
