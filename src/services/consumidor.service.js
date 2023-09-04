import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Encargado } from '../DAO/models/encargado.model.js';
import { Productor } from '../DAO/models/Productor.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';

class ConsumidorService {
  //TODO revisar getall y getone por el include distinto
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
  //TODO refactorizar esto para que actualice consumidor, despues llame a los service correspondiente si tiene el rango, y los actualice
  async updateOne(id, consumidor) {
    const consumidorbase = await Consumidor.findByPk(id);
    const encargado = await Encargado.findByPk(consumidor.encargadoId);
    const productor = await Productor.findByPk(consumidor.productorId);
    const repartidor = await Repartidor.findByPk(consumidor.repartidorId);
    //const usuario = await Usuario.findByPk(consumidor.usuarioId);
    //console.log(usuario.dataValues.tipoUsuario);
    if (consumidorbase) {
      consumidorbase.nombre = consumidor.nombre;
      consumidorbase.apellido = consumidor.apellido;
      consumidorbase.fechaNacimiento = datetime.datetime.strptime(consumidor.fechaNacimiento, '%Y-%m-%d %H:%M:%S') ;
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
      encargado.cuit = consumidor.encargado.cuit;
      encargado.razonSocial = consumidor.encargado.razonSocial;
      encargado.estaValido = consumidor.encargado.estaValido;
      encargado.habilidato = consumidor.encargado.habilidato;
      await encargado.save();
      //usuario.tipoUsuario = 'Responsable';
      //console.log('Nuevo tipo de usuario:', usuario.tipoUsuario);
      //await usuario.save();
    }
    if (productor && consumidor.Productor) {
      productor.cuit = consumidor.Productor.cuit;
      productor.razonSocial = consumidor.Productor.razonSocial;
      productor.estaValido = consumidor.Productor.estaValido;
      productor.habilidato = consumidor.Productor.habilidato;
      await productor.save();
      //usuario.tipoUsuario = 'Productor';
      //console.log('Nuevo tipo de usuario:', usuario.tipoUsuario);
      //await usuario.save();
    }
    if (repartidor && consumidor.repartidore) {
      repartidor.cuit = consumidor.repartidore.cuit;
      await repartidor.save();
      //usuario.tipoUsuario = 'Repartidor';
      //console.log('Nuevo tipo de usuario:', usuario.tipoUsuario);
      //await usuario.save();
    }

    //console.log(usuario);
    return { consumidorbase, encargado, productor, repartidor /*, usuario*/ };
  }

  async updateOneNew(id, newData) {
    console.log('New data' + newData.nombreC);
    console.log('New data' + newData.apellidoC);
    console.log('New data' + newData.fechaNacimiento);
    console.log('New data' + newData.provinciaC);
    console.log('New data' + newData.localidad);
    console.log('New data' + newData.telefono);
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
        consumidor.fechaNacimiento = newData.fechaNacimiento//datetime.datetime.strptime(newData.fechaNacimiento, '%Y-%m-%d %H:%M:%S') ;;
      
      }

      await consumidor.save();

      console.log(
        'Actualizado' + consumidor.nombre + ' ' + consumidor.apellido + ' ' + consumidor.fechaNacimiento + ' ' + consumidor.provincia + ' ' + consumidor.localidad + ' ' + consumidor.telefono
      );

      return consumidor;
    } catch (error) {
      throw error;
    }
  }

  async create(consumidor,id) {
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
    return consumidorCreado
  }
}

export const consumidorService = new ConsumidorService();
