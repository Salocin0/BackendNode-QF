import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { consumidorService } from './consumidor.service.js';

class PuestoService {
  //hacer que los metodos llamen a los service, no a los models
  async getAll(consumidorId) {
    const consumidor = await Consumidor.findByPk(consumidorId);
    const puestos = await Puesto.findAll({
      where: {
        encargadoId: consumidor.encargadoId,
        habilitado: true,
      },
    });
    return puestos;
  }

  async getOne(id) {
    const puesto = Puesto.findByPk(id);
    return puesto;
  }

  async update(id, puesto) {
    const puestodb = await Puesto.findByPk(id);
    console.log(puesto);
    puestodb.numeroCarro = puesto.numeroCarro;
    puestodb.nombreCarro = puesto.nombreCarro;
    puestodb.tipoNegocio = puesto.tipoNegocio;
    //puestodb.telefonoContacto = puesto.telefonoContacto;
    //puestodb.razonSocial = puesto.razonSocial;
    //puestodb.cuit = puesto.cuit;
    puestodb.telefonoCarro = puesto.telefonoCarro;
    await puestodb.save();
    return puestodb;
  }

  async create(nuevoPuesto) {
    const consumidor = await consumidorService.getOne(nuevoPuesto.consumidorId);
    const puestoendb = await Puesto.findOne({
      where: {
        numeroCarro: nuevoPuesto.numeroCarro,
        /*nombreCarro: nuevoPuesto.nombreCarro,*/
        encargadoId: consumidor.encargadoId,
      },
    });
    nuevoPuesto.encargadoId = consumidor.encargadoId;
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
