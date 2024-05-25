import { PuntoEncuentro } from "../DAO/models/puntoEncuentro.model.js";
import { eventoService } from "./evento.service.js";

class PuntoEncuentroService {
  async getAll(consumidorId) {
    const eventos = await eventoService.getAll(consumidorId);
    const eventoIds = eventos.map(evento => evento.id);
    const puntosEncuentro = await PuntoEncuentro.findAll({
      where: {
        eventoId: {
          [Op.in]: eventoIds,
        },
      },
    });
  
    return puntosEncuentro;
  }

  async getAllInEvent(eventoId) {
    const puntosEncuentro = await PuntoEncuentro.findAll({
      where: {
        eventoId: eventoId,
      },
    });
    return puntosEncuentro
  }

  async getOne(id) {
    const puntoEncuentro = puntoEncuentro.findByPk(id);
    return puntoEncuentro;
  }

  async update(id, newPuntoEncuentro) {
    const puntoEncuentro = this.getOne(id)
    puntoEncuentro.nombre = newPuntoEncuentro.nombre;
    puntoEncuentro.longitud = newPuntoEncuentro.longitud;
    puntoEncuentro.latitud = newPuntoEncuentro.latitud;

    await puntoEncuentro.save();
    return puntoEncuentro;
  }

  async create(newPuntoEncuentro) {
      const puntoEncuentro = await PuntoEncuentro.create(newPuntoEncuentro);
      return puntoEncuentro;
  }

  async delete(id) {
    const puntoEncuentro = await PuntoEncuentro.findByPk(id);
    puntoEncuentro.habilitado = false;
    await puntoEncuentro.save();
    return puntoEncuentro
  }

}

export const puntoEncuentroService = new PuntoEncuentroService();
