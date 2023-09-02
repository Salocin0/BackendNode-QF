import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Op } from 'sequelize';
import { createHashPW } from '../util/bcrypt.js';

class UserService {
  async getAll() {
    const usuarios = await Usuario.findAll();
    return usuarios;
  }

  async getOne(id) {
    const usuarios = await Usuario.findOne({ where: { id: id } });
    return usuarios;
  }

  async existeUsuario(correo, usuario) {
    const existingUser = await Usuario.findOne({
      where: {
        [Op.or]: [{ usuario: usuario }, { email: correo }],
      },
    });

    if (existingUser) {
      return true;
    } else {
      return false;
    }
  }
  //TODO ESTE METODO TENDRIA QUE CREAR AL USUARIO Y LLAMAR AL SERVICE DE CONSUMIDOR PARA QUE CREE LA OTRA PARTE Y QUE DESPUES ESTE TOME EL COSUMIDOR Y LO ACTUALICE ACA
  async create(consumidor) {
    const user = {
      contraseña: createHashPW(consumidor.usuario.contraseña),
      usuario: consumidor.usuario.nombreDeUsuario,
      email: consumidor.usuario.correoElectronico,
      tipoUsuario: consumidor.usuario.tipoUsuario,
      fechaAlta: Date.now(),
    };
    const usuarioCreado = await Usuario.create(user);
    const consum = {
      nombre: consumidor.nombre,
      apellido: consumidor.apellido,
      dni: consumidor.dni,
      localidad: consumidor.localidad,
      provincia: consumidor.provincia,
      telefono: consumidor.telefono,
      fechaNacimiento: consumidor.fechaDeNacimiento,
      usuarioId: usuarioCreado.id,
    };
    const consumidorCreado = await Consumidor.create(consum);
    usuarioCreado.consumidoreId = consumidorCreado.id;
    usuarioCreado.save();
    return { usuarioCreado, consumidorCreado };
  }
}

export const userService = new UserService();
