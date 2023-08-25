import { Puesto } from "../DAO/models/puesto.model.js";
import { Usuario } from "../DAO/models/users.model.js";
import { Consumidor } from "../DAO/models/consumidor.model.js";

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

    async create(nuevoPuesto) {
        const puestoendb = await Puesto.findOne({
          where: {
            nombre: nuevoPuesto.nombre,
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