import { Puesto } from "../DAO/models/puesto.model.js";
import { Usuario } from "../DAO/models/users.model.js";
import { Consumidor } from "../DAO/models/consumidor.model.js";
import { encargadoService } from "./encargado.service.js";
import { consumidorService } from "./consumidor.service.js";

class PuestoService {
    async getAll(consumidorId){
      const consumidor = await Consumidor.findByPk(consumidorId);
      const puestos = await Puesto.findAll({where: {
        encargadoId: consumidor.encargadoId,
        habilitado: true
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

    async create(nuevoPuesto) {
        const consumidor = await consumidorService.getOne(nuevoPuesto.consumidorId)
        const puestoendb = await Puesto.findOne({
          where: {
            nombreCarro: nuevoPuesto.nombreCarro,
            encargadoId: consumidor.encargadoId
          },
        });
        if (puestoendb) {
          return false;
        } else {
          const puestoCreado = await Puesto.create(nuevoPuesto);
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