import { Op } from 'sequelize';
import { notificationTexts } from '../config/notificacionesConfig.js';
import { Asociacion } from '../DAO/models/asociacion.model.js';
import { EstadosAsociaciones } from '../enums/Estados.enums.js';
import { consumidorService } from './consumidor.service.js';
import { eventoService } from './evento.service.js';
import { notificacionesService } from './notificaciones.service.js';
import { puestoService } from './puesto.service.js';

class AsociacionService {
  async getAll(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const asociaciones = await Asociacion.findAll({
      where: {
        repartidoreId: consumidor.repartidorId,
      },
    });
    return asociaciones;
  }

  async getAllByPuesto(estado, consumidorId) {
    try {
      const eventos = await eventoService.getAllInState(estado)
      const puestos = await puestoService.getAllByEncargado(consumidorId);
      if(eventos.length==0|| puestos.length==0){
        return null;
      }
      const eventoIds = eventos.map(evento => evento.id);
      const puestoIds = puestos.map(puesto => puesto.id);
      const asociaciones = await Asociacion.findAll({
        where: {
          puestoId: puestoIds,
          eventoId: eventoIds,
          estado: {
            [Op.not]: 'Cancelada'
          }
        },
      });
  
      return asociaciones;
    } catch (error) {
      console.error('Error al obtener asociaciones por puesto:', error);
      throw error;
    }
  }
  

  async getAllByEncargado(consumidorId) {
    const puestos = await puestoService.getAllByEncargado(consumidorId);
    const puestoIds = puestos.map(puesto => puesto.id);
    const asociaciones = await Asociacion.findAll({
      where: {
        puestoId: puestoIds,
        estado: {
          [Op.not]: 'Cancelada'
        }
      },
    });
    
    return asociaciones;
  }
  

  async getAllInEvent(id) {
    const asociaciones = await Asociacion.findAll({
      where: {
        eventoId: id,
      },
    });
    return asociaciones;
  }

  async getOne(id) {
    const asociacion = await Asociacion.findOne({ where: { id } });
    return asociacion;
  }

  async create(nuevaAsociacion, respuestas, consumidorId, restricciones) {
    if (consumidorId !== 0) {
      const consumidor = await consumidorService.getOne(consumidorId);
      nuevaAsociacion.repartidoreId = consumidor?.repartidorId;
    } else {
      nuevaAsociacion.repartidoreId = null;
    }
    if (nuevaAsociacion.puestoId === 0) {
      nuevaAsociacion.puestoId = null;
    }

    nuevaAsociacion.estado = EstadosAsociaciones.Pendiente;
    const asociacionCreada = await Asociacion.create(nuevaAsociacion);
    console.log(respuestas);
    if (respuestas !== null) {
      const respuestasArray = Object.values(respuestas);
      await Promise.all(
        respuestasArray.map(async (respuesta) => {
          await nuevaRespuesta.save();
        })
      );
    }
    return asociacionCreada;
  }

  async getByEventoPuesto(eventoId, puestoId) {
    const asociacion = await Asociacion.findOne({
      where: {
        eventoId: eventoId,
        puestoId: puestoId,
      },
    });
    return asociacion;
  }

  async getEventoByRepartidor(eventoId, consumidorId) {
    console.log(consumidorId);
    const consumidorCompleto = await consumidorService.getOne(consumidorId);

    const asociacion = await Asociacion.findOne({
      where: {
        eventoId: eventoId,
        repartidoreId: consumidorCompleto.repartidorId,
      },
    });
    return asociacion;
  }

  async rechazar(id,motivo) {
    const asociacion = await this.getOne(id);
    asociacion.estado = EstadosAsociaciones.Rechazada;
    asociacion.motivo = motivo
    await asociacion.save();
    return asociacion;
  }

  async cancelar(id,motivo) {
    const asociacion = await this.getOne(id);
    asociacion.estado = EstadosAsociaciones.Cancelada;
    asociacion.motivo = motivo
    await asociacion.save();
    return asociacion;
  }

  async aceptar(id,motivo) {
    const asociacion = await this.getOne(id);
    asociacion.estado = EstadosAsociaciones.Aceptada;
    asociacion.motivo = motivo
    await asociacion.save();
    return asociacion;
  }

  async sendNotificacionesWeb(eventoid){
    const tituloNotificacion = notificationTexts.productor.tituloAsociacion;
    const descripcionNotificacion = notificationTexts.productor.descripcionAsociacion;


    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacion(eventoid, tituloNotificacion,descripcionNotificacion);

    return resultadoNotificacion;
  }




}

export const asociacionService = new AsociacionService();
