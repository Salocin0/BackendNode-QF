import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { consumidorService } from './consumidor.service.js';
import { asociacionService } from './asociacion.service.js';
import { EstadosAsociaciones } from '../enums/Estados.enums.js';

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

  async getAllInEvent(eventoId) {
    const asociaciones = await asociacionService.getAllInEvent(eventoId);
    const puestosPromises = asociaciones
      .filter(asociacion => asociacion.puestoId !== null)
      .filter(asociacion => asociacion.estado == EstadosAsociaciones.Aceptada)
      .map(async asociacion => {
        const puesto = await Puesto.findByPk(asociacion.puestoId);
        return puesto && puesto.habilitado == 1 ? puesto : null;
      });
  
    const puestos = await Promise.all(puestosPromises);
    const filteredPuestos = puestos.filter(puesto => puesto !== null);
  
    return filteredPuestos;
  }
  
  
  async getAllDeshabilitados(consumidorId) {
    const consumidor = await Consumidor.findByPk(consumidorId);
    const puestos = await Puesto.findAll({
      where: {
        encargadoId: consumidor.encargadoId,
        habilitado: false,
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

  async updateHabilitado(id) {
    const puesto = await Puesto.findByPk(id);
    puesto.habilitado = true;
    await puesto.save();
  }
    async create(nuevoPuesto) {
        const consumidor = await consumidorService.getOne(nuevoPuesto.consumidorId)
        const puestoendb = await Puesto.findOne({
          where: {
            numeroCarro: nuevoPuesto.numeroCarro,
            /*nombreCarro: nuevoPuesto.nombreCarro,*/
            encargadoId: consumidor.encargadoId
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
