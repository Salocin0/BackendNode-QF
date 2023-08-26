import { Puesto } from "../DAO/models/puesto.model.js";
import { Usuario } from "../DAO/models/users.model.js";
import { Consumidor } from "../DAO/models/consumidor.model.js";
import { encargadoService } from "./encargado.service.js";
import { consumidorService } from "./consumidor.service.js";

class PuestoService {
    async getAll(userid){
      const user = await Usuario.getOne({where: {
        id: userid
      }})
      const consumidor = await Consumidor.findByPk(user.consumidorId);
      const puestos = await Puesto.findAll({where: {
        encargadoId: consumidor.encargadoId,
      }}); 
      return puestos
    }

    async getOne(id) {
        const puesto = Puesto.findByPk(id);
        return puesto;
      }
  
    async update(id, puesto) {
        const puestodb = await Puesto.findByPk(id);
        puestodb.nombre = puesto.nombre;
        puestodb.fechaBromatologica = puesto.fechaBromatologica;
        puestodb.descripcion = puesto.descripcion;
        await puestodb.save();
        return puestodb;
    }

    async create(nuevoPuesto,consumidorId) {
        const consumidor = await consumidorService.getOne(consumidorId)
        const puestoendb = await Puesto.findOne({
          where: {
            nombreCarro: nuevoPuesto.nombreCarro,
            encargadoId: consumidor.encargadoId
          },
        });
        if (puestoendb) {
          return false;
        } else {
          Puesto={
            numeroCarro:nuevoPuesto.numeroCarro,
            nombreCarro:nuevoPuesto.nombreCarro,
            tipoNegocio:nuevoPuesto.tipoNegocio,
            consumidorId:consumidorId,
          }
          const puestoCreado = await Puesto.create(Puesto);
          return puestoCreado;
        }
      }

    async delete(id) {
        const puesto = await Puesto.findByPk(id);
        puesto.habilitado = false;
        await puesto.save();
    }

}

export const puestoService = new PuestoService();