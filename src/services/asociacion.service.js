import { Asocioacion } from "../DAO/models/asociacion.model.js";
import { RTARestriccion } from "../DAO/models/RTARestriccion.model.js";
import { EstadosAsociaciones } from "../enums/Estados.enums.js";

class AsociacionService {
  async getAll(consumidorId) {
    const asociaciones = await Asocioacion.findAll({
        where: {
            consumidoreId: consumidorId,
        },
      });
    return asociaciones;
  }

  async getAllInEvent(id) {
    const asociaciones = await Asocioacion.findAll({
      where: {
        eventoId: id,
      },
    });
    return asociaciones;
  }

  async getOne(id) {
    const asociacion = await Asocioacion.findByPk(id);
    return asociacion;
  }

  async create(nuevaAsociacion,respuestas) {
    const asociacionCreada = await Asocioacion.create(nuevaAsociacion);
    if(respuestas.lenght>0){
        respuestas.array.forEach(async respuesta => {
            const nuevaRespuesta = await RTARestriccion.create(respuesta)
            nuevaRespuesta.asociacionId = asociacionCreada.id;
            nuevaRespuesta.save()
        });
    }
    return asociacionCreada
  }

  async rechazar(id) {
    const asociacion = this.getOne(id)
    asociacion.estado = EstadosAsociaciones.Rechazada;
    asociacion.save()
    return asociacion
  }

  async aceptar(id) {
    const asociacion = this.getOne(id)
    asociacion.estado = EstadosAsociaciones.Aceptada;
    asociacion.save()
    return asociacion
  }
}

export const asociacionService = new AsociacionService();
