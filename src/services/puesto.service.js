import { Puesto } from "../DAO/models/puesto.model.js";

class PuestoService {
    async getAll(){
      const puestos = await Puesto.findAll(); 
      return puestos
    }

    async getOne(id) {
        const puesto = Puesto.findByPk(id);
        return puesto;
      }
  
    async update(id, nombre, fechaBromatologica, descripcion) {
        const puesto = Puesto.findByPk(id);
        puesto.nombre = nombre;
        puesto.fechaBromatologica = fechaBromatologica;
        puesto.descripcion = descripcion;
        await puesto.save();
        return puesto;
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