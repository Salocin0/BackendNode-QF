import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Productor } from '../DAO/models/Productor.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { Usuario } from '../DAO/models/users.model.js';

class ConsumidorService {
  async getAll() {
    const consumidores = await Consumidor.findAll({ include: [EncargadosPuestos, Productores, Repartidores] });
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
    const encargado = await Encargado.findByPk(consumidor.encargadoId);
    const productor = await Productor.findByPk(consumidor.productorId);
    const repartidor = await Repartidor.findByPk(consumidor.repartidorId);
    const usuario = await Usuario.findByPk(consumidor.usuarioId);
    console.log(usuario.dataValues.tipoUsuario);
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
      consumidorbase.repartidorId = consumidor.repartidorId;
      await consumidorbase.save();
    }
    if (encargado && consumidor.encargado) {
      //encargado.cuit = consumidor.encargado.cuit;
      //encargado.razonSocial = consumidor.encargado.razonSocial;
      //encargado.estaValido = consumidor.encargado.estaValido;
      //encargado.habilidato = consumidor.encargado.habilidato;
      //await encargado.save();
      usuario.tipoUsuario = 'Responsable';
      console.log('Nuevo tipo de usuario:', usuario.tipoUsuario); 
      await usuario.save();
    }
    if (productor && consumidor.Productor) {
      productor.cuit = consumidor.Productor.cuit;
      productor.razonSocial = consumidor.Productor.razonSocial;
      productor.estaValido = consumidor.Productor.estaValido;
      productor.habilidato = consumidor.Productor.habilidato;
      await productor.save();
      usuario.tipoUsuario = 'Productor'; 
      console.log('Nuevo tipo de usuario:', usuario.tipoUsuario); 
      await usuario.save();
    }
    if (repartidor && consumidor.repartidore) {
      repartidor.cuit = consumidor.repartidore.cuit;
      await repartidor.save();
      usuario.tipoUsuario = 'Repartidor'; 
      console.log('Nuevo tipo de usuario:', usuario.tipoUsuario);
      await usuario.save();
    }

    console.log(usuario);
    return { consumidorbase, encargado, productor, repartidor, usuario };
  }
}

export const consumidorService = new ConsumidorService();
