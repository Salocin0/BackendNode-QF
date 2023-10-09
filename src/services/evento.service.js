import { Consumidor } from "../DAO/models/consumidor.model.js";
import { Evento } from "../DAO/models/evento.model.js";
import { consumidorService } from "./consumidor.service.js";

class EventoService {
  //hacer que los metodos llamen a los service, no a los models
  async getAll(consumidorId) {
    const consumidor = await Consumidor.findByPk(consumidorId);
    const eventos = await Evento.findAll({
      where: {
        productorId: consumidor.productorId,
        habilitado: true,
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
    eventodb.fechaInicio = evento.fechaInicio;
    eventodb.horaInicio = evento.horaInicio;
    eventodb.fechaFin = evento.fechaFin;
    eventodb.cantidadPuestos = evento.cantidadPuestos;
    eventodb.cantidadRepartidores = evento.cantidadRepartidores;
    eventodb.capacidadMaxima = evento.capacidadMaxima;
    eventodb.conButaca = evento.conButaca;
    eventodb.conRepartidor = evento.conRepartidor;
    eventodb.conPreventa = evento.conPreventa;
    eventodb.tipoPreventa = evento.tipoPreventa;
    eventodb.fechaInicioPreventa = evento.fechaInicioPreventa;
    eventodb.fechaFinPreventa = evento.fechaFinPreventa;
    eventodb.plazoCancelacionPreventa = evento.plazoCancelacionPreventa;
    eventodb.linkVentaEntradas = evento.linkVentaEntradas;
    eventodb.ubicacion = evento.ubicacion;
    await eventodb.save();
    return eventodb;
  }

    async create(nuevoEvento) {
        const consumidor = await consumidorService.getOne(nuevoEvento.consumidorId)
        const eventoendb = await Evento.findOne({
          where: {
            productorId: consumidor.productorId
          },
        });
        nuevoEvento.ProductorId = consumidor.productorId;
        if (eventoendb) {
          return false;
        } else {
          const eventoCreado = await Evento.create(nuevoEvento);
          return eventoCreado;
        }
      }

  async delete(id) {
    const evento = await Evento.findByPk(id);
    evento.habilitado = false;
    await evento.save();
  }
}

export const eventoService = new EventoService();
