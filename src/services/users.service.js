import { Op } from 'sequelize';
import { Usuario } from '../DAO/models/users.model.js';
import { createHashPW } from '../util/bcrypt.js';
import { consumidorService } from './consumidor.service.js';
import { encargadoService } from './encargado.service.js';
import { productorService } from './productor.service.js';
import { repartidorService } from './repartidor.service.js';

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

  async existeUsuarioNombre(usuario) {
    try {
      const existingUser = await Usuario.findOne({
        where: {
          [Op.or]: [{ usuario: usuario }],
        },
      });

      if (existingUser) {
        return {
          exists: true,
          code: 200,
        };
      } else {
        return {
          exists: false,
          code: 200, 
        };
      }
    } catch (error) {
      console.error(error);
      return {
        exists: false,
        code: 500,
        error: error.message,
      };
    }
  }

  async create(usuario) {
    const user = {
      contraseña: createHashPW(usuario.contraseña),
      usuario: usuario.nombreDeUsuario,
      email: usuario.correoElectronico,
      tipoUsuario: usuario.tipoUsuario,
      fechaAlta: Date.now(),
    };
    const usuariocreado = await Usuario.create(user);
    return usuariocreado;
  }
  //TODO ESTE METODO TENDRIA QUE CREAR AL USUARIO Y LLAMAR AL SERVICE DE CONSUMIDOR PARA QUE CREE LA OTRA PARTE Y QUE DESPUES ESTE TOME EL COSUMIDOR Y LO ACTUALICE ACA

  async register(usuario, consumidor, productor, encargado, repartidor) {
    const user = await this.create(usuario);
    const consu = await consumidorService.create(consumidor, user.id);
    let prod = null;
    let enca = null;
    let repa = null;
    user.consumidoreId = consu.id;
    user.save();
    if (user.tipoUsuario == 'productor') {
      prod = await productorService.create(productor);
      consu.productorId = prod.id;
      consu.save();
    } else if (user.tipoUsuario == 'encargado') {
      enca = await encargadoService.create(encargado);
      consu.encargadoId = enca.id;
      consu.save();
    } else if (user.tipoUsuario == 'repartidor') {
      repa = await repartidorService.create();
      consu.repartidorId = repa.id;
      consu.save();
    }
    return { user, consu, prod, enca, repa };
  }

  async updateRol(id, rol, datosRol) {
    const user = await Usuario.findOne({ where: { id: id } });
    if (user) {
      console.log(datosRol)
      if (rol == 'productor') {
        const productor = await productorService.create(datosRol);
        const consumidor = await consumidorService.getOne(user.consumidoreId )
        consumidor.productorId = productor.id;
        consumidor.save();
        user.tipoUsuario = 'productor';
      } else if (rol == 'encargado') {
        const encargado = await encargadoService.create(datosRol);
        const consumidor = await consumidorService.getOne(user.consumidoreId)
        consumidor.encargadoId = encargado.id;
        consumidor.save();
        user.tipoUsuario = 'encargado';
      } else if (rol == 'repartidor') {
        const repartidor = await repartidorService.create();
        const consumidor = await consumidorService.getOne(user.consumidoreId)
        consumidor.repartidorId = repartidor.id;
        consumidor.save();
        user.tipoUsuario = 'repartidor';
      } else if (rol == 'consumidor') {
        user.tipoUsuario = 'consumidor';
      }else{
        return undefined
      }
      user.save();
      return user;
    } else {
      return undefined
    }
  }
}

export const userService = new UserService();
