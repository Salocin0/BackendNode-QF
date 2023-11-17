import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { EstadosEvento } from '../enums/Estados.enums.js';
<<<<<<< HEAD
=======
import { estadosEvento } from '../estados/estados/estadosEvento.js';
>>>>>>> da3d894c772e7c0842f411fddf45a30c221d90d1
import { consumidorService } from './consumidor.service.js';
import { restriccionService } from './restriccion.service.js';
class EventoService {
  //hacer que los metodos llamen a los service, no a los models
  async getAll(consumidorId) {
    const consumidor = await Consumidor.findByPk(consumidorId);
    console.log("aca")
    console.log(consumidor);
    const eventos = await Evento.findAll({
      where: {
        productorId: consumidor.productorId,
      },
    });
    return eventos;
  }

  async getAllInState(estado) {
    const eventos = await Evento.findAll({
      where: {
        estado: 'Confirmado'
      },
    });
    return eventos;
  }

  async getOne(id) {
    const evento = Evento.findByPk(id);
    return evento;
  }

  async update(id, evento) {
    const eventodb = await Evento.findByPk(id);
    eventodb.nombre = evento.nombre;
    eventodb.descripcion = evento.descripcion;
    eventodb.tipoEvento = evento.tipoEvento;
    eventodb.tipoPago = evento.tipoPago;
    eventodb.fechaInicio = evento.fechaInicio || eventodb.fechaInicio;
    eventodb.horaInicio = evento.horaInicio || eventodb.horaInicio;
    eventodb.fechaFin = evento.fechaFin || eventodb.fechaFin;
    eventodb.cantidadPuestos = evento.cantidadPuestos;
    eventodb.cantidadRepartidores = evento.cantidadRepartidores;
    eventodb.capacidadMaxima = evento.capacidadMaxima;
    eventodb.conButaca = evento.conButaca;
    eventodb.conRepartidor = evento.conRepartidor || eventodb.conRepartidor;
    eventodb.conPreventa = evento.conPreventa;
    eventodb.tipoPreventa = evento.tipoPreventa;
    eventodb.fechaInicioPreventa = evento.fechaInicioPreventa;
    eventodb.fechaFinPreventa = evento.fechaFinPreventa;
    eventodb.plazoCancelacionPreventa = evento.plazoCancelacionPreventa;
    eventodb.linkVentaEntradas = evento.linkVentaEntradas;
    eventodb.ubicacion = evento.ubicacion;
    eventodb.estado = evento.estado;
    await eventodb.save();
    evento.restricciones.forEach(async (restriccion) => {
      console.log(restriccion.id);
      if (restriccion.id === undefined) {
        restriccion.eventoId = id;
        restriccion.consumidoreId = evento.consumidorId;
        await restriccionService.create(restriccion);
      }
    });
    return eventodb;
  }

  async create(nuevoEvento) {
    const consumidor = await consumidorService.getOne(nuevoEvento.consumidorId);
    const eventoendb = await Evento.findOne({
      where: {
        productorId: consumidor.productorId,
      },
    });
    nuevoEvento.ProductorId = consumidor.productorId;
    if (eventoendb) {
      return false;
    } else {
      const eventoCreado = await Evento.create(nuevoEvento);
      this.crearEvento(eventoCreado);
      nuevoEvento.restricciones.forEach(async (restriccion) => {
        restriccion.eventoId = eventoCreado.id;
        const restriccionCreada = await restriccionService.create(restriccion);
        console.log(restriccionCreada);
      });
      return eventoCreado;
    }
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
        } else {
          console.log('se verifico pero no');
        }
      })
    });
  }

  async crearEvento(evento) {
    estadosEvento.enPreparacion.crearEvento(evento);
  }





}

export const eventoService = new EventoService();
