import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { EstadosEvento } from '../enums/Estados.enums.js';
import { estadosEvento } from '../estados/estados/estadosEvento.js';
import { asociacionService } from './asociacion.service.js';
import { consumidorService } from './consumidor.service.js';
import { restriccionService } from './restriccion.service.js';

class EventoService {
  async getAll(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const eventos = await Evento.findAll({
      where: {
        productorId: consumidor.productorId,
      },
    });
    return eventos;
  }

  async getAll() {
    const eventos = await Evento.findAll();
    return eventos;
  }

  async getAllInState(estado) {
    const eventos = await Evento.findAll({
      where: {
        estado: estado,
      },
      include: [
        {
          model: DiaEvento,
        },
      ],
    });
    return eventos;
  }


  async getOne(id) {
    const evento = Evento.findByPk(id);
    return evento;
  }

  async getOneDays(id) {
    try {
      const evento = await Evento.findByPk(id);

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      console.log(evento);
      return evento.cantidadDiasEvento;
    } catch (error) {
      console.error("Error al obtener la cantidad de días del evento:", error);
      throw error;
    }
  }

    async update(id, datosEventoActualizar) {
      if (!datosEventoActualizar) {
        throw new Error('El objeto evento no puede ser undefined');
      }

      const eventodb = await Evento.findByPk(id);
      console.log("EVENTODB" + eventodb)

      if (!eventodb) {
        throw new Error('No se encontró el evento con el id proporcionado');
      }

      // Solo actualiza los campos si están definidos en el objeto datosEventoActualizar
      if (datosEventoActualizar.nombre !== undefined) eventodb.nombre = datosEventoActualizar.nombre;
      if (datosEventoActualizar.descripcion !== undefined) eventodb.descripcion = datosEventoActualizar.descripcion;
      if (datosEventoActualizar.tipoEvento !== undefined) eventodb.tipoEvento = datosEventoActualizar.tipoEvento;
      if (datosEventoActualizar.tipoPago !== undefined) eventodb.tipoPago = datosEventoActualizar.tipoPago;
      if (datosEventoActualizar.fechaInicio !== undefined) eventodb.fechaHoraInicio = datosEventoActualizar.fechaInicio;
      if (datosEventoActualizar.horaInicio !== undefined) eventodb.horaInicio = datosEventoActualizar.horaInicio;
      if (datosEventoActualizar.fechaFin !== undefined) eventodb.fechaHoraFin = datosEventoActualizar.fechaFin;
      if (datosEventoActualizar.cantidadPuestos !== undefined) eventodb.cantidadPuestos = datosEventoActualizar.cantidadPuestos;
      if (datosEventoActualizar.cantidadRepartidores !== undefined) eventodb.cantidadRepartidores = datosEventoActualizar.cantidadRepartidores;
      if (datosEventoActualizar.capacidadMaxima !== undefined) eventodb.capacidadMaxima = datosEventoActualizar.capacidadMaxima;
      if (datosEventoActualizar.conButaca !== undefined) eventodb.conButaca = datosEventoActualizar.conButaca;
      if (datosEventoActualizar.conRepartidor !== undefined) eventodb.conRepartidor = datosEventoActualizar.conRepartidor;
      if (datosEventoActualizar.conPreventa !== undefined) eventodb.conPreventa = datosEventoActualizar.conPreventa;
      if (datosEventoActualizar.tipoPreventa !== undefined) eventodb.tipoPreventa = datosEventoActualizar.tipoPreventa;
      if (datosEventoActualizar.fechaInicioPreventa !== undefined) eventodb.fechaInicioPreventa = datosEventoActualizar.fechaInicioPreventa;
      if (datosEventoActualizar.fechaFinPreventa !== undefined) eventodb.fechaFinPreventa = datosEventoActualizar.fechaFinPreventa;
      if (datosEventoActualizar.plazoCancelacionPreventa !== undefined) eventodb.plazoCancelacionPreventa = datosEventoActualizar.plazoCancelacionPreventa;
      if (datosEventoActualizar.linkVentaEntradas !== undefined) eventodb.linkVentaEntradas = datosEventoActualizar.linkVentaEntradas;
      if (datosEventoActualizar.ubicacion !== undefined) eventodb.ubicacion = datosEventoActualizar.ubicacion;
      if (datosEventoActualizar.estado !== undefined) eventodb.estado = datosEventoActualizar.estado;
      if (datosEventoActualizar.cantidadDiasEvento !== undefined) eventodb.cantidadDiasEvento = datosEventoActualizar.cantidadDiasEvento;

      this.actualizarEvento(eventodb);


      await eventodb.save();

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
    const consumidor = await consumidorService.getOne(nuevoEvento.consumidorId);
    nuevoEvento.productorId = consumidor.productorId;
    console.log("service:" + nuevoEvento.estado);
    const eventoCreado = await Evento.create(nuevoEvento);

    this.crearEvento(eventoCreado);

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
    console.log(Date.now());
    await this.getAllInState(EstadosEvento.Confirmado).then((eventos) => {
      console.log(eventos);
      eventos.forEach(async (evento) => {
        console.log(evento);
        if (true) {
          evento.estado = EstadosEvento.EnCurso;
          await evento.save();
        }
      });
    });
  }

  async crearEvento(evento) {
    estadosEvento.EnPreparacion.crearEvento(evento);
  }

  async actualizarEvento(evento) {
    estadosEvento.EnPreparacion1.actualizarEvento(evento);
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

      const eventosFiltrados = eventosEnPreparacion.filter((evento) => !eventosAsociados.includes(evento.id));

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

      const eventosFiltrados = eventosEnPreparacion.filter((evento) => !eventosAsociados.includes(evento.id));

      return eventosFiltrados;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

}

export const eventoService = new EventoService();
