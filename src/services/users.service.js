import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Op } from 'sequelize';
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
  

  async register(usuario,consumidor,productor,encargado,repartidor) {
    const user = await this.create(usuario);
    const consu = await consumidorService.create(consumidor,user.id)
    let prod = null;
    let enca = null;
    let repa = null;
    user.consumidoreId = consu.id;
    user.save();
    if(user.tipoUsuario == "productor"){
      prod = await productorService.create(productor)
      consu.productorId = prod.id;
      consu.save();
    }else if(user.tipoUsuario == "encargado"){
      enca = await encargadoService.create(encargado)
      consu.encargadoId = enca.id;
      consu.save();
    }else if(user.tipoUsuario == "repartidor"){
      repa = await repartidorService.create()
      consu.repartidorId = repa.id;
      consu.save();
    }
    return { user, consu, prod, enca, repa };
  }
}

export const userService = new UserService();
