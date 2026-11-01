import { Op } from 'sequelize';
import { sequelize } from '../util/connections.js';
import { Evento } from '../DAO/models/evento.model.js';
import { Restriccion } from '../DAO/models/Restriccion.model.js';
import { RTARestriccion } from '../DAO/models/RTARestriccion.model.js';
import { RequisitoError, normalizeRequirementAnswers } from '../util/requisitosAsociacion.js';
import { notificationTexts } from '../config/notificacionesConfig.js';
import { Asociacion } from '../DAO/models/asociacion.model.js';
import { EstadosAsociaciones } from '../enums/Estados.enums.js';
import { consumidorService } from './consumidor.service.js';
import { eventoService } from './evento.service.js';
import { notificacionesService } from './notificaciones.service.js';
import { puestoService } from './puesto.service.js';
import { Puesto } from '../DAO/models/puesto.model.js';

class AsociacionService {
  async getAll(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const asociaciones = await Asociacion.findAll({
      where: {
        repartidoreId: consumidor.repartidorId,
      },
      include: [
        {
          model: Puesto,
        },
      ],
    });

    return asociaciones;
  }

  async getAllByPuesto(estado, consumidorId) {
    try {
      const eventos = await eventoService.getAllInState(estado);
      const puestos = await puestoService.getAllByEncargado(consumidorId);
      if (eventos.length == 0 || puestos.length == 0) {
        return null;
      }
      const eventoIds = eventos.map((evento) => evento.id);
      const puestoIds = puestos.map((puesto) => puesto.id);
      const asociaciones = await Asociacion.findAll({
        where: {
          puestoId: puestoIds,
          eventoId: eventoIds,
          estado: {
            [Op.not]: 'Cancelada',
          },
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
    const puestoIds = puestos.map((puesto) => puesto.id);
    const asociaciones = await Asociacion.findAll({
      where: {
        puestoId: puestoIds,
        estado: {
          [Op.not]: 'Cancelada',
        },
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

  async create(nuevaAsociacion, respuestas, consumidorId) {
    if (Number(consumidorId) !== 0) {
      const consumidor = await consumidorService.getOne(consumidorId);
      if (!consumidor?.repartidorId) throw new RequisitoError('El usuario no tiene un rol de repartidor habilitado');
      nuevaAsociacion.repartidoreId = consumidor.repartidorId;
    } else nuevaAsociacion.repartidoreId = null;
    if (Number(nuevaAsociacion.puestoId) === 0) nuevaAsociacion.puestoId = null;
    nuevaAsociacion.estado = EstadosAsociaciones.Pendiente;
    const asociacionCreada = await sequelize.transaction(async (transaction) => {
      const evento = await Evento.findByPk(nuevaAsociacion.eventoId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!evento) throw new RequisitoError('Evento no encontrado', 404);
      const existing = await Asociacion.findOne({ where: { eventoId: nuevaAsociacion.eventoId, ...(nuevaAsociacion.repartidoreId ? { repartidoreId: nuevaAsociacion.repartidoreId } : { puestoId: nuevaAsociacion.puestoId }), estado: { [Op.ne]: 'Cancelada' } }, transaction });
      if (existing) throw new RequisitoError('Ya tenés una solicitud para este evento', 409);
      const requirements = respuestas !== null ? await Restriccion.findAll({ where: { eventoId: evento.id }, transaction }) : [];
      const answers = respuestas !== null ? normalizeRequirementAnswers(requirements, respuestas) : [];
      const association = await Asociacion.create(nuevaAsociacion, { transaction });
      for (const answer of answers) await RTARestriccion.create({ ...answer, asociacionId: association.id }, { transaction });
      return association;
    });
    // A notification failure must not turn a persisted request into a reported failure.
    this.sendNotificacionesAsociacionCreada(asociacionCreada).catch((error) => console.error('No se pudo notificar la asociación:', error.message));
    return asociacionCreada;
  }

  async sendNotificacionesAsociacionCreada(asociacion) {
    const tituloNotificacion = notificationTexts.productor.tituloAsociacion;
    const descripcionNotificacion = notificationTexts.productor.descripcionAsociacion;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacion(asociacion.eventoId, tituloNotificacion, descripcionNotificacion);
    return resultadoNotificacion;
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

  async rechazar(id, motivo) {
    const asociacion = await this.getOne(id);
    asociacion.estado = EstadosAsociaciones.Rechazada;
    asociacion.motivo = motivo;
    await asociacion.save();
    this.sendNotificacionesRechazarAsociacion(asociacion);
    return asociacion;
  }

  async sendNotificacionesRechazarAsociacion(asociacion) {
    if (asociacion.repartidoreId) {
      this.sendNotificacionesRechazarAsociacionRepartido(asociacion.id);
    } else {
      this.sendNotificacionesRechazarAsociacionPuesto(asociacion.id);
    }
    this.sendNotificacionesRechazarAsociacionProductor(asociacion.eventoId);
  }

  async sendNotificacionesRechazarAsociacionRepartido(Id) {
    const tituloNotificacion = notificationTexts.repartidor.solicitudRechazada;
    const descripcionNotificacion = notificationTexts.repartidor.descripcionRechazada;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacionAPartirAsociacion(Id, tituloNotificacion, descripcionNotificacion);
    return resultadoNotificacion;
  }

  async sendNotificacionesRechazarAsociacionProductor(eventoid) {
    const tituloNotificacion = notificationTexts.productor.tituloAsociacionRechazada;
    const descripcionNotificacion = notificationTexts.productor.descripcionAsociacionRechazada;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesProductorEvento(eventoid, tituloNotificacion, descripcionNotificacion);
    return resultadoNotificacion;
  }

  async sendNotificacionesRechazarAsociacionPuesto(Id) {
    const tituloNotificacion = notificationTexts.encargado.solicitudRechazada;
    const descripcionNotificacion = notificationTexts.encargado.descripcionRechazada;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacionAPartirAsociacion(Id, tituloNotificacion, descripcionNotificacion);
    return resultadoNotificacion;
  }

  async cancelar(id, motivo) {
    const asociacion = await this.getOne(id);
    asociacion.estado = EstadosAsociaciones.Cancelada;
    asociacion.motivo = motivo;
    await asociacion.save();
    return asociacion;
  }

  async aceptar(id, motivo) {
    const asociacion = await this.getOne(id);
    asociacion.estado = EstadosAsociaciones.Aceptada;
    asociacion.motivo = motivo;
    await asociacion.save();
    this.sendNotificacionesAceptarAsociacion(asociacion);
    return asociacion;
  }

  async sendNotificacionesAceptarAsociacion(asociacion) {
    if (asociacion.repartidoreId) {
      this.sendNotificacionesAceptarAsociacionRepartido(asociacion.id);
    } else {
      this.sendNotificacionesAceptarAsociacionPuesto(asociacion.id);
    }
  }

  async sendNotificacionesAceptarAsociacionRepartido(Id) {
    const tituloNotificacion = notificationTexts.repartidor.solicitudAceptada;
    const descripcionNotificacion = notificationTexts.repartidor.descripcionAceptada;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacionAPartirAsociacion(Id, tituloNotificacion, descripcionNotificacion);
    return resultadoNotificacion;
  }

  async sendNotificacionesAceptarAsociacionPuesto(Id) {
    const tituloNotificacion = notificationTexts.encargado.solicitudAceptada;
    const descripcionNotificacion = notificationTexts.encargado.descripcionAceptada;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacionAPartirAsociacion(Id, tituloNotificacion, descripcionNotificacion);
    return resultadoNotificacion;
  }

  async sendNotificacionesWebRepartidorAsociacion(eventoid) {
    const tituloNotificacion = notificationTexts.repartidor.solicitudAceptada;
    const descripcionNotificacion = notificationTexts.repartidor.descripcionAceptada;

    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacion(eventoid, tituloNotificacion, descripcionNotificacion);

    return resultadoNotificacion;
  }

  async sendNotificacionesWebEventoAsociacion(eventoid) {
    const tituloNotificacion = notificationTexts.productor.tituloAsociacion;
    const descripcionNotificacion = notificationTexts.productor.descripcionAsociacion;

    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacion(eventoid, tituloNotificacion, descripcionNotificacion);

    return resultadoNotificacion;
  }

  async sendNotificacionesWebRechazarAsociacionRepartido(Id) {
    const tituloNotificacion = notificationTexts.repartidor.titulo;
    const descripcionNotificacion = notificationTexts.repartidor.descripcionRechazada;
    const resultadoNotificacion = await notificacionesService.enviarNotificacionesAsociacionAceptaradaRepartidor(Id, tituloNotificacion, descripcionNotificacion);

    return resultadoNotificacion;
  }
}

export const asociacionService = new AsociacionService();
