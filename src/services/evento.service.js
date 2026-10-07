import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { EstadosEvento } from '../enums/Estados.enums.js';
import { estadosEvento } from '../estados/estados/estadosEvento.js';
import { asociacionService } from './asociacion.service.js';
import { consumidorService } from './consumidor.service.js';
import { restriccionService } from './restriccion.service.js';
import { withDbRetry } from '../util/dbRetry.js';
import { normalizeEventoPayload, resolveEstadoOnUpdate } from '../util/eventoPayload.js';
import { isEventoFinalizado, withEstadoEfectivo } from '../util/validation.js';

class EventoService {
  async getAll(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const eventos = await Evento.findAll({
      where: {
        productorId: consumidor.productorId,
      },
      include: [{
        model: DiaEvento,
        required: false,
      }],
    });

    return eventos;
  }
  

  async getAll() {
    const eventos = await Evento.findAll({include: [{
      model: DiaEvento,
      required: false,
    }]});
    return eventos.map((evento) => withEstadoEfectivo(evento));
  }

  async getAllInState(estado) {
    try {
      const eventos = await Evento.findAll({
        where: {
          estado: estado,
        },
        include: [
          {
            model: DiaEvento,
            required: false, // include DiaEvento even if it's not associated with Evento
          },
        ],
      });
  
      // Display the date-derived state and hide events that already ended from every other state list.
      const efectivos = eventos.map((evento) => withEstadoEfectivo(evento));
      return estado === 'Finalizado' ? efectivos : efectivos.filter((evento) => evento.estado !== 'Finalizado');
    } catch (error) {
      console.error('Error fetching events with estado:', error);
      throw error;
    }
  }


  async getOne(id) {
    const evento = Evento.findByPk(id,{
      include: [{
        model: DiaEvento,
        required: false,
      }]
    });
    return evento;
  }

  async getOneDays(id) {
    try {
      const evento = await Evento.findByPk(id);

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      return evento.cantidadDiasEvento;
    } catch (error) {
      console.error("Error al obtener la cantidad de días del evento:", error);
      throw error;
    }
  }

    async update(id, rawDatosEventoActualizar) {
      if (!rawDatosEventoActualizar) {
        throw new Error('El objeto evento no puede ser undefined');
      }
      // Validates ISO dates/numbers and maps wizard aliases to model columns (throws EventoPayloadError).
      const datosEventoActualizar = normalizeEventoPayload(rawDatosEventoActualizar);

      const eventodb = await withDbRetry('buscar evento por id para actualizar', () => Evento.findByPk(id), {
        attempts: 4,
        baseDelayMs: 1000,
      });
      if (!eventodb) {
        throw new Error('No se encontró el evento con el id proporcionado');
      }

      // Solo actualiza los campos si están definidos en el objeto datosEventoActualizar
      if (datosEventoActualizar.nombre !== undefined) eventodb.nombre = datosEventoActualizar.nombre;
      if (datosEventoActualizar.descripcion !== undefined) eventodb.descripcion = datosEventoActualizar.descripcion;
      if (datosEventoActualizar.tipoEvento !== undefined) eventodb.tipoEvento = datosEventoActualizar.tipoEvento;
      if (datosEventoActualizar.tipoPago !== undefined) eventodb.tipoPago = datosEventoActualizar.tipoPago;
      if (datosEventoActualizar.img !== undefined) eventodb.img = datosEventoActualizar.img;
      if (datosEventoActualizar.imagenEvento !== undefined) eventodb.img = datosEventoActualizar.imagenEvento;
      if (datosEventoActualizar.croquis !== undefined) eventodb.croquis = datosEventoActualizar.croquis;
      if (datosEventoActualizar.fechaHoraInicio !== undefined) eventodb.fechaHoraInicio = datosEventoActualizar.fechaHoraInicio;
      if (datosEventoActualizar.horaInicio !== undefined) eventodb.horaInicio = datosEventoActualizar.horaInicio;
      if (datosEventoActualizar.fechaHoraFin !== undefined) eventodb.fechaHoraFin = datosEventoActualizar.fechaHoraFin;
      if (datosEventoActualizar.cantidadPuestos !== undefined) eventodb.cantidadPuestos = datosEventoActualizar.cantidadPuestos;
      if (datosEventoActualizar.cantidadRepartidores !== undefined) eventodb.cantidadRepartidores = datosEventoActualizar.cantidadRepartidores;
      if (datosEventoActualizar.capacidadMaxima !== undefined) eventodb.capacidadMaxima = datosEventoActualizar.capacidadMaxima;
      if (datosEventoActualizar.conButaca !== undefined) eventodb.conButaca = datosEventoActualizar.conButaca;
      if (datosEventoActualizar.conRepartidor !== undefined) eventodb.conRepartidor = datosEventoActualizar.conRepartidor;
      if (datosEventoActualizar.conPreventa !== undefined) eventodb.conPreventa = datosEventoActualizar.conPreventa;
      if (datosEventoActualizar.tienePreventa !== undefined) eventodb.tienePreventa = datosEventoActualizar.tienePreventa;
      if (datosEventoActualizar.tipoPreventa !== undefined) eventodb.tipoPreventa = datosEventoActualizar.tipoPreventa;
      if (datosEventoActualizar.fechaInicioPreventa !== undefined) eventodb.fechaInicioPreventa = datosEventoActualizar.fechaInicioPreventa;
      if (datosEventoActualizar.fechaFinPreventa !== undefined) eventodb.fechaFinPreventa = datosEventoActualizar.fechaFinPreventa;
      if (datosEventoActualizar.plazoCancelacionPreventa !== undefined) eventodb.plazoCancelacionPreventa = datosEventoActualizar.plazoCancelacionPreventa;
      if (datosEventoActualizar.linkVentaEntradas !== undefined) eventodb.linkVentaEntradas = datosEventoActualizar.linkVentaEntradas;
      if (datosEventoActualizar.ubicacion !== undefined) eventodb.ubicacion = datosEventoActualizar.ubicacion;
      if (datosEventoActualizar.localidad !== undefined) eventodb.localidad = datosEventoActualizar.localidad;
      if (datosEventoActualizar.provincia !== undefined) eventodb.provincia = datosEventoActualizar.provincia;
      if (datosEventoActualizar.latitud !== undefined) eventodb.latitud = datosEventoActualizar.latitud;
      if (datosEventoActualizar.longitud !== undefined) eventodb.longitud = datosEventoActualizar.longitud;
      // Drafts progress through the wizard; completed/confirmed events keep their state.
      eventodb.estado = resolveEstadoOnUpdate(eventodb.estado, datosEventoActualizar.estado);
      if (datosEventoActualizar.cantidadDiasEvento !== undefined) eventodb.cantidadDiasEvento = datosEventoActualizar.cantidadDiasEvento;


      await withDbRetry('guardar actualización de evento', () => eventodb.save(), {
        attempts: 4,
        baseDelayMs: 1000,
      });

      if (datosEventoActualizar.restricciones) {
        for (const restriccion of datosEventoActualizar.restricciones) {
          if (restriccion.id === undefined) {
            restriccion.eventoId = id;
            restriccion.consumidorId = datosEventoActualizar.consumidorId; // Aquí también
            await restriccionService.create(restriccion);
          }
        }
      }

      return eventodb;
    }



  async create(nuevoEvento) {
    if (!nuevoEvento.productorId) {
      const consumidor = await withDbRetry('buscar consumidor para crear evento', () => consumidorService.getOne(nuevoEvento.consumidorId), {
        attempts: 4,
        baseDelayMs: 1000,
      });
      nuevoEvento.productorId = consumidor.productorId;
    }
    console.log("service:" + nuevoEvento.estado);
    const eventoCreado = await withDbRetry('crear evento', () => Evento.create(nuevoEvento), {
      attempts: 4,
      baseDelayMs: 1000,
    });

    // Wizard drafts are created in EnPreparacion1; crearEvento would overwrite them with EnPreparacion (completed).
    if (nuevoEvento.estado !== 'EnPreparacion1') {
      await this.crearEvento(eventoCreado);
    }

    if (nuevoEvento.restricciones && nuevoEvento.restricciones.length > 0) {
      nuevoEvento.restricciones.forEach(async (restriccion) => {
        restriccion.eventoId = eventoCreado.id;
        try {
          const restriccionCreada = await restriccionService.create(restriccion);
          console.log(restriccionCreada);
        } catch (error) {
          console.error("Error al crear la restricción:", error);
        }
      });
    }

    return eventoCreado;
  }

  async delete(id) {
    const evento = await Evento.findByPk(id);
    evento.habilitado = false;
    evento.estado = EstadosEvento.Cancelado;
    await evento.save();
    const restricciones = await restriccionService.getAllInEvent(id);
    restricciones.forEach(async (restriccion) => {
      restriccionService.delete(restriccion.id);
    });
  }

  async istime() {
    // Needs real model instances (save), so it must not go through the display-only getAllInState.
    await Evento.findAll({ where: { estado: EstadosEvento.Confirmado } }).then((eventos) => {
      eventos.forEach(async (evento) => {
        evento.estado = EstadosEvento.EnCurso;
        await evento.save();
      });
    });
  }

  async crearEvento(evento) {
    return estadosEvento.EnPreparacion.crearEvento(evento);
  }

  async actualizarEvento(evento) {
    return estadosEvento.EnPreparacion1.actualizarEvento(evento);
  }


  async getAllInStateAndWithoutAsociacionValida(estado, idConsumidor) {
    try {
      const asociaciones = await asociacionService.getAll(idConsumidor);
      const eventosAsociados = [];

      for (const asociacion of asociaciones) {
        if (asociacion.estado !== 'Cancelada') {
          eventosAsociados.push(asociacion.eventoId);
        }
      }

      const eventosEnPreparacion = await this.getAllInState(estado);

      // Events whose end date already passed are not valid targets even if their stored state lags behind.
      const eventosFiltrados = eventosEnPreparacion.filter(
        (evento) => !eventosAsociados.includes(evento.id) && !isEventoFinalizado(evento)
      );

      return eventosFiltrados;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  async getAllInStateAndWithoutAsociacionPuestoValida(estado,idConsumidor,idPuesto) {
    try {
      const asociaciones = await asociacionService.getAll(idConsumidor);
      const asociacionesFiltradas = asociaciones.filter((asociacion)=> asociacion.puestoId == idPuesto)
      const eventosAsociados = [];

      for (const asociacion of asociacionesFiltradas) {
        if (asociacion.estado !== 'Cancelada') {
          eventosAsociados.push(asociacion.eventoId);
        }
      }

      const eventosEnPreparacion = await this.getAllInState(estado);

      const eventosFiltrados = eventosEnPreparacion.filter(
        (evento) => !eventosAsociados.includes(evento.id) && !isEventoFinalizado(evento)
      );

      return eventosFiltrados;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

}

export const eventoService = new EventoService();
