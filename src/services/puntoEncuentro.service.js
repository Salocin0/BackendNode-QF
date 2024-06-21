import { PuntoEncuentro } from "../DAO/models/puntoEncuentro.model.js";
import { eventoService } from "./evento.service.js";

class PuntoEncuentroService {
  async getAll(consumidorId) {
    const eventos = await eventoService.getAll(consumidorId);
    const eventoIds = eventos.map((evento) => evento.id);
    const puntosEncuentro = await PuntoEncuentro.findAll({
      where: {
        eventoId: {
          [Op.in]: eventoIds,
        },
        habilitado: true,
      },
    });

    return puntosEncuentro.filter((punto) => punto.habilitado);
  }

  async getAllInEvent(eventoId) {
    const puntosEncuentro = await PuntoEncuentro.findAll({
      where: {
        eventoId: eventoId,
        habilitado: true,
      },
    });

    return puntosEncuentro.filter((punto) => punto.habilitado);
  }

  async getOne(id) {
    const puntoEncuentro = await PuntoEncuentro.findByPk(id);
    return puntoEncuentro;
  }

  async update(id, nombre,latitud,longitud) {
    const puntoEncuentro = await this.getOne(id);
    puntoEncuentro.nombre = nombre;
    puntoEncuentro.longitud = longitud;
    puntoEncuentro.latitud = latitud;

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
    return puntoEncuentro;
  }
}

export const puntoEncuentroService = new PuntoEncuentroService();
