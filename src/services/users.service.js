import { createHash } from 'crypto';
import { Op } from 'sequelize';
import { Usuario } from '../DAO/models/users.model.js';
import { createHashPW } from '../util/bcrypt.js';
import { sendEmail } from '../util/emailSender.js';
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
    const usuario = await Usuario.findOne({ where: { id: id } });
    return usuario;
  }

  async getOneByCodigoDeRecuperacion(codigo) {
    const usuario = await Usuario.findOne({
      where: {
        codigoRecuperacion: codigo,
      },
    });
    return usuario;
  }

  async getOneByEmail(correoElectronico) {
    const usuario = await Usuario.findOne({
      where: {
        email: correoElectronico,
      },
    });
    return usuario;
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
      tokenWeb: usuario.tokenWeb,
    };
    const usuariocreado = await Usuario.create(user);
    return usuariocreado;
  }

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
    this.enviarEmailValidarEmail(user.id, user.email);
    return { user, consu, prod, enca, repa };
  }

  async updateRol(id, rol, datosRol) {
    const user = await Usuario.findOne({ where: { id: id } });
    if (user) {
      console.log(datosRol);
      if (rol == 'productor') {
        const productor = await productorService.create(datosRol);
        const consumidor = await consumidorService.getOne(user.consumidoreId);
        consumidor.productorId = productor.id;
        consumidor.save();
        user.tipoUsuario = 'productor';
      } else if (rol == 'encargado') {
        const encargado = await encargadoService.create(datosRol);
        const consumidor = await consumidorService.getOne(user.consumidoreId);
        consumidor.encargadoId = encargado.id;
        consumidor.save();
        user.tipoUsuario = 'encargado';
      } else if (rol == 'repartidor') {
        const repartidor = await repartidorService.create();
        const consumidor = await consumidorService.getOne(user.consumidoreId);
        consumidor.repartidorId = repartidor.id;
        consumidor.save();
        user.tipoUsuario = 'repartidor';
      } else if (rol == 'consumidor') {
        user.tipoUsuario = 'consumidor';
      } else {
        return undefined;
      }
      user.save();
      return user;
    } else {
      return undefined;
    }
  }
  // TO DO AGREGAR URL DEL FRONT DESPLEGADO .ENV
  async enviarEmailValidarEmail(id, email) {
    const usuario = await Usuario.findByPk(id);
    const hash = createHash('sha256').update(Date.now().toString()).digest('hex');
    usuario.codigoValidacion = hash;
    await usuario.save();
    const url = `localhost:3000/habilitar-Usuario-email/${id}/${hash}`;
    const respuestaEmail = await sendEmail(email, 'Habilitar Usuario', `para validar el email, ingrese al siguiente link: ${url}`);
    return respuestaEmail;
  }
  // TO DO AGREGAR URL DEL FRONT DESPLEGADO .ENV
  async habilitarUsuario(id, email) {
    const usuario = await Usuario.findByPk(id);
    if (usuario.email === email) {
      const hash = createHash('sha256').update(Date.now().toString()).digest('hex');
      usuario.codigoHabilitacion = hash;
      await usuario.save();
      const url = `localhost:3000/habilitar-Usuario/${id}/${hash}`;
      const respuestaEmail = await sendEmail(email, 'Habilitar Usuario', `para habilitar el usuario nuevamente, ingrese al siguiente link: ${url}`);
      return respuestaEmail;
    }

    await usuario.save();
  }

  async deshabilitarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (usuario) {
      usuario.habilitado = false;
      await usuario.save();
      return usuario;
    }
  }

  async setTokens(userid,tokenWeb,tokenMobile) {
    const usuario = await Usuario.findByPk(userid);
    if (usuario) {
      if(tokenWeb!=null){
        usuario.tokenWeb = tokenWeb;
      }
      if(tokenMobile){
        usuario.tokenMobile=tokenMobile
      }
      await usuario.save();
      return usuario;
    }
  }

  
}

export const userService = new UserService();
