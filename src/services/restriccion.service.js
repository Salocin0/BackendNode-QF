import { Restriccion } from '../DAO/models/Restriccion.model.js';

class RestriccionService {
  async getAll(consumidorId) {
    const restricciones = await Restriccion.findAll({
      where: {
        consumidoreId: consumidorId,
      },
    });
    return restricciones;
  }

  async getAllInEvent(id) {
    const restricciones = await Restriccion.findAll({
      where: {
        eventoId: id,
      },
    });
    return restricciones;
  }

  async getOne(id) {
    const restriccion = await Restriccion.findByPk(id);
    return restriccion;
  }

  async create(nuevaRestriccion) {
    const restriccionCreado = await Restriccion.create(nuevaRestriccion);
    return restriccionCreado;
  }

  async delete(id) {
    const restriccion = await Restriccion.findByPk(id);
    if (!restriccion) {
      return null;
    }
    restriccion.eventoId = null;
    await restriccion.save();
    return restriccion;
  }
}

export const restriccionService = new RestriccionService();
