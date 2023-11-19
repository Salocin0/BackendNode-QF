import { Asociacion } from "../DAO/models/asociacion.model.js";
import { RTARestriccion } from "../DAO/models/RTARestriccion.model.js";
import { EstadosAsociaciones } from "../enums/Estados.enums.js";
import { consumidorService } from "./consumidor.service.js";

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

    // Crear la asociación si no hay una existente para este evento y puesto
    const existingAsociacion = await Asociacion.findOne({
      where: {
        eventoId: nuevaAsociacion.eventoId,
        puestoId: nuevaAsociacion.puestoId,
      },
    });

    if (existingAsociacion) {
      throw new Error('La asociación para este evento y puesto ya existe');
    }

    const asociacionCreada = await Asociacion.create(nuevaAsociacion);

    if (respuestas !== null) {
      const respuestasArray = Object.values(respuestas);
      await Promise.all(respuestasArray.map(async (respuesta) => {
        const nuevaRespuesta = await RTARestriccion.create(respuesta);
        nuevaRespuesta.AsociacionId = asociacionCreada.id;
        await nuevaRespuesta.save();
      }));
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


  async rechazar(id) {
    const asociacion = await this.getOne(id)
    asociacion.estado = EstadosAsociaciones.Rechazada;
    await asociacion.save()
    return asociacion
  }

  async cancelar(id) {
    const asociacion = await this.getOne(id)
    asociacion.estado = EstadosAsociaciones.Cancelada;
    await asociacion.save();
    return asociacion
  }

  async aceptar(id) {
    const asociacion = await this.getOne(id)
    asociacion.estado = EstadosAsociaciones.Aceptada;
    await asociacion.save();
    return asociacion
  }



}

export const asociacionService = new AsociacionService();
