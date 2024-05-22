import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Productor } from '../DAO/models/Productor.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { encargadoService } from './encargado.service.js';
import { productorService } from './productor.service.js';
import { repartidorService } from './repartidor.service.js';

class ConsumidorService {
  async getAll() {
    const consumidores = await Consumidor.findAll({ include: [Encargado, Productor, Repartidor] });
    return consumidores;
  }

  async getOne(id) {
    const consumidor = await Consumidor.findOne({
      where: { id: id },
      include: [Encargado, Productor, Repartidor],
    });
    return consumidor;
  }

  async updateOne(id, consumidor) {
    const consumidorbase = await Consumidor.findByPk(id);
    const encargado = await encargadoService.getOne(consumidor.encargadoId);
    const productor = await productorService.getOne(consumidor.productorId);
    const repartidor = await repartidorService.getOne(consumidor.repartidorId);
    if (consumidorbase) {
      consumidorbase.nombre = consumidor.nombre;
      consumidorbase.apellido = consumidor.apellido;
      consumidorbase.fechaNacimiento = datetime.datetime.strptime(consumidor.fechaNacimiento, '%Y-%m-%d %H:%M:%S');
      consumidorbase.dni = consumidor.dni;
      consumidorbase.localidad = consumidor.localidad;
      consumidorbase.telefono = consumidor.telefono;
      consumidorbase.habilitado = consumidor.habilitado;
      consumidorbase.encargadoId = consumidor.encargadoId;
      consumidorbase.productorId = consumidor.productorId;
      consumidorbase.repartidorId = consumidor.repartidorId;
      await consumidorbase.save();
    }
    if (encargado && consumidor.encargado) {
      encargado.cuit = consumidor.encargado.cuit;
      encargado.razonSocial = consumidor.encargado.razonSocial;
      encargado.estaValido = consumidor.encargado.estaValido;
      encargado.habilitado = consumidor.encargado.habilitado;
      await encargado.save();
    }
    if (productor && consumidor.Productor) {
      productor.cuit = consumidor.Productor.cuit;
      productor.razonSocial = consumidor.Productor.razonSocial;
      productor.estaValido = consumidor.Productor.estaValido;
      productor.habilitado = consumidor.Productor.habilitado;
      await productor.save();
    }
    if (repartidor && consumidor.repartidore) {
      repartidor.cuit = consumidor.repartidore.cuit;
      await repartidor.save();
    }
    return { consumidorbase, encargado, productor, repartidor };
  }

  async updateOneNew(id, newData) {
    try {
      const consumidor = await Consumidor.findByPk(id);
      if (!consumidor) {
        return null;
      } else {
        consumidor.nombre = newData.nombreC;
        consumidor.apellido = newData.apellidoC;
        consumidor.provincia = newData.provinciaC;
        consumidor.localidad = newData.localidad;
        consumidor.telefono = newData.telefono;
        consumidor.dni = newData.dniC;
      }
      await consumidor.save();
      return consumidor;
    } catch (error) {
      throw error;
    }
  }

  async create(consumidor, id) {
    const consum = {
      nombre: consumidor.nombre,
      apellido: consumidor.apellido,
      dni: consumidor.dni,
      localidad: consumidor.localidad,
      provincia: consumidor.provincia,
      telefono: consumidor.telefono,
      fechaNacimiento: consumidor.fechaDeNacimiento,
      usuarioId: id,
    };
    const consumidorCreado = await Consumidor.create(consum);
    return consumidorCreado;
  }
}

export const consumidorService = new ConsumidorService();
