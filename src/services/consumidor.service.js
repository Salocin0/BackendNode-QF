import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Productor } from '../DAO/models/Productor.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';

class ConsumidorService {
  async getAll() {
    const consumidores = await Consumidor.findAll({ include: [Encargado, Productor ,Repartidor] });
    return consumidores;
  }

  async getOne(id) {
    const consumidor = await Consumidor.findOne({
      where: { id: id },
      include: [Encargado, Productor , Repartidor],
    });
    return consumidor;
  }

  async updateOne(id, consumidor) {
    const consumidorbase = await Consumidor.findByPk(id);
    const encargado = await Encargado.findByPk(consumidor.encargadoId);
    const productor = await Productor.findByPk(consumidor.productorId);
    if (consumidorbase) {
      consumidorbase.nombre = consumidor.nombre;
      consumidorbase.apellido = consumidor.apellido;
      consumidorbase.fechaNacimiento = consumidor.fechaNacimiento;
      consumidorbase.dni = consumidor.dni;
      consumidorbase.localidad = consumidor.localidad;
      consumidorbase.telefono = consumidor.telefono;
      consumidorbase.habilidato = consumidor.habilidato;
      consumidorbase.encargadoId = consumidor.encargadoId;
      consumidorbase.productorId = consumidor.productorId;
      await consumidorbase.save();
    }
    if (encargado && consumidor.encargadosPuesto) {
      encargado.cuit = consumidor.encargadosPuesto.cuit;
      encargado.razonSocial = consumidor.encargadosPuesto.razonSocial;
      encargado.estaValido = consumidor.encargadosPuesto.estaValido;
      encargado.habilidato = consumidor.encargadosPuesto.habilidato;
      await encargado.save();
    }
    if (productor && consumidor.productore) {
      productor.cuit = consumidor.productor.cuit;
      productor.razonSocial = consumidor.productor.razonSocial;
      productor.estaValido = consumidor.productor.estaValido;
      productor.habilidato = consumidor.productor.habilidato;
      await productor.save();
    }
    return { consumidorbase, encargado, productor };
  }
}

export const consumidorService = new ConsumidorService();
