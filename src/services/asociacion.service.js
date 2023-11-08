import { Asociacion } from "../DAO/models/asociacion.model.js";
import { RTARestriccion } from "../DAO/models/RTARestriccion.model.js";
import { EstadosAsociaciones } from "../enums/Estados.enums.js";
import { consumidorService } from "./consumidor.service.js";

class AsociacionService {
  async getAll(consumidorId) {
    const asociaciones = await Asociacion.findAll({
        where: {
            consumidoreId: consumidorId,
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
    const asociacion = await Asociacion.findByPk(id);
    return asociacion;
  }

  async create(nuevaAsociacion,respuestas,consumidorId) {
    if(consumidorId!==0){
      const consumidor = await consumidorService.getOne(consumidorId)
      nuevaAsociacion.repartidoreId=consumidor.repartidorId
    }else{
      nuevaAsociacion.repartidoreId=null
    }

    if(nuevaAsociacion.puestoId===0){
      nuevaAsociacion.puestoId=null
    }
    
    nuevaAsociacion.estado=EstadosAsociaciones.Pendiente
    const asociacionCreada = await Asociacion.create(nuevaAsociacion);
    console.log(respuestas)
    if (respuestas !== null) {
      const respuestasArray = Object.values(respuestas);
      await Promise.all(respuestasArray.map(async (respuesta) => {
        const nuevaRespuesta = await RTARestriccion.create(respuesta);
        nuevaRespuesta.AsociacionId = asociacionCreada.id;
        await nuevaRespuesta.save();
      }));
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
