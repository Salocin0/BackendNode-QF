import crypto from 'crypto';
import passport from 'passport';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Usuario } from '../DAO/models/users.model.js';
import { sessionStore } from '../app.js';
import { userService } from '../services/users.service.js';
import { createHashPW } from '../util/bcrypt.js';
import { sendEmail } from '../util/emailSender.js';


class UserController {
  async getAllcontroller(req, res) {
    try {
      const usuarios = await userService.getAll();
      if (usuarios.length > 0) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all users',
          data: usuarios,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'Users not found',
          data: {},
        });
      }
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async RegisterControler(req, res) {
    try {
      //validacion 
      const usuario = req.body.usuario;
      console.log(usuario);
      const consumidor = req.body.consumidor;
      const productor = req.body.productor;
      const encargado = req.body.encargado;
      const repartidor = req.body.repartidor;
      const usuariocreado = await userService.register(usuario, consumidor, productor, encargado, repartidor);
      //verificar
      if (usuariocreado) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'user created',
          data: usuariocreado,
        });
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async updateRolController(req, res) {
    const { id, rol } = req.params;
    const datosRol = req.body;
    console.log(id, rol, datosRol);
    const user = await userService.updateRol(id, rol, datosRol);
    if (user !== undefined) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'user updated',
        data: user,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'user or rol not found',
        data: {},
      });
    }
  }

  async enviarEmailValidarEmail(id, email) {
    const respuestaEmail = await userService.enviarEmailValidarEmail(id, email);
    return respuestaEmail;
  }

  async habilitar(req, res) {
    const id = req.body.id;
    const user = await userService.getOne(id);
    console.log(id);
    if (user) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'email valido',
        code: 200,
        data: user.email.substring(0, 3),
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'user not found',
        data: {},
      });
    }
  }

  async habilitarUsuario(req, res) {
    const id = req.body.id;
    const email = req.body.email;
    const user = await userService.habilitarUsuario(id, email);
    console.log(id);
    if (user) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'email valido',
        code: 200,
        data: user,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'user not found',
        data: {},
      });
    }
  }

  async deshabilitarUsuario(req, res) {
    const id = req.params.id;
    const user = await userService.deshabilitarUsuario(id);
    if (user) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'Cuenta deshabilitada',
        code: 200,
        data: user,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'user not found',
        data: {},
      });
    }
  }

  //pasar al service
  async getTokenByEncargadoId(encargadoId) {
    try {
      const consumidor = await Consumidor.findOne({
        where: { encargadoId: encargadoId },
      });

      if (!consumidor) {
        throw new Error(`No se encontró el consumidor con encargadoId ${encargadoId}`);
      }

      const usuarioId = consumidor.usuarioId;



      // El usuario asociado debería estar disponible a través de la relación definida en Consumidor

      if (!usuarioId) {
        throw new Error(`No se encontró el usuario asociado al usuarioId  ${usuarioId}`);
      }

      const usuario = await Usuario.findOne({
        where: { id: usuarioId },
      });

      const tokenUsuarioWeb = usuario.tokenWeb;
      const tokenUsuarioMobile = usuario.tokenMobile;

      // Devolver el tokenWeb del usuario encontrado
      return {tokenUsuarioWeb,tokenUsuarioMobile};
    } catch (error) {
      console.error(`Error al obtener el token del encargadoId ${encargadoId}:`, error);
      throw error;
    }
  }

  async getTokenByProductorId(productorId) {
    try {
      const consumidor = await Consumidor.findOne({
        where: { productorId: productorId },
      });

      if (!consumidor) {
        throw new Error(`No se encontró el consumidor con productorId ${productorId}`);
      }

      const usuarioId = consumidor.usuarioId;



      // El usuario asociado debería estar disponible a través de la relación definida en Consumidor

      if (!usuarioId) {
        throw new Error(`No se encontró el usuario asociado al usuarioId  ${usuarioId}`);
      }

      const usuario = await Usuario.findOne({
        where: { id: usuarioId },
      });

      const tokenUsuarioWeb = usuario.tokenWeb;
      const tokenUsuarioMobile = usuario.tokenMobile;

      // Devolver el tokenWeb del usuario encontrado
      return {tokenUsuarioWeb,tokenUsuarioMobile};
    } catch (error) {
      console.error(`Error al obtener el token del encargadoId ${productorId}:`, error);
      throw error;
    }
  }

  async getTokenByRepartidorrId(repartidorId) {
    try {
      const consumidor = await Consumidor.findOne({
        where: { repartidorId: repartidorId },
      });

      if (!consumidor) {
        throw new Error(`No se encontró el consumidor con productorId ${repartidorId}`);
      }

      const usuarioId = consumidor.usuarioId;



      // El usuario asociado debería estar disponible a través de la relación definida en Consumidor

      if (!usuarioId) {
        throw new Error(`No se encontró el usuario asociado al usuarioId  ${usuarioId}`);
      }

      const usuario = await Usuario.findOne({
        where: { id: usuarioId },
      });

      const tokenUsuarioWeb = usuario.tokenWeb;
      const tokenUsuarioMobile = usuario.tokenMobile;

      // Devolver el tokenWeb del usuario encontrado
      return {tokenUsuarioWeb,tokenUsuarioMobile};
    } catch (error) {
      console.error(`Error al obtener el token del encargadoId ${productorId}:`, error);
      throw error;
    }
  }


  async userSession(req, res) {
    console.log(req.body.sessionID)
    sessionStore.get(req.body.sessionID, async (error, sessionData) => {
      console.log(sessionData)
      if (error) {
        return res.status(500).json({
          status: 'error',
          msg: 'Error al obtener la sesión',
          data: null,
        });
      }
      if (sessionData && sessionData.user) {
        return res.status(200).json({
          status: 'success',
          msg: 'Sesión de usuario encontrada',
          data: sessionData.user,
        });
      } else {
        return res.status(400).json({
          status: 'error',
          msg: 'Sesión de usuario no encontrada',
          data: null,
        });
      }
    });
  }

  async habilitarUsuario(req, res) {
    try {
      const id = req.params.id;
      const codigo = req.params.codigo;
      const usuario = await userService.getOne(id);
      if (usuario?.codigoHabilitacion === codigo) {
        usuario.habilitado = true;
        usuario.codigoHabilitacion = null;
        await usuario.save();
        return res.status(200).json({
          status: 'sucess',
          msg: 'user habilitado',
          code: 200,
          data: usuario,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'incorrect code',
          code: 200,
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getOne(req, res) {
    try {
      const userId = req.params.id;
      const usuario = await userService.getOne(userId);
      if (usuario !== null) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'user found',
          data: usuario,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'user with id ' + req.params.id + ' not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async recuperarContraseñaCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const { contraseña } = req.body;
      const usuario = await userService.getOneByCodigoDeRecuperacion(codigo);
      if (usuario !== null) {
        usuario.contraseña = createHashPW(contraseña);
        usuario.codigoRecuperacion = null;
        await usuario.save();
        return res.status(200).json({
          status: 'sucess',
          msg: 'contraseña actualizada',
          code: 200,
          data: usuario,
        });
      } else {
        return res.status(400).json({
          status: 'error',
          msg: 'codigo de recuperacion incorrecto',
          code: 400,
          data: null,
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async recuperarContraseña(req, res) {
    try {
      const { correoElectronico } = req.body;
      const usuario = await userService.getOneByEmail(correoElectronico);
      if (usuario !== null) {
        const hash = crypto.createHash('sha256').update(Date.now().toString()).digest('hex'); // Usa crypto.createHash
        usuario.codigoRecuperacion = hash;
        await usuario.save();
        sendEmail(
          correoElectronico,
          'Recuperar contraseña',
          'Se solicitó un cambio de contraseña. Para cambiar tu contraseña, haz clic en el siguiente enlace: http://localhost:3000/cambiar-contrasenia/' + hash  +
          ' o si queres recuperar a traves de nuestra app ingresa este codigo: ' + hash
        );
        return res.status(200).json({
          status: 'success',
          msg: 'Email enviado',
          code: 200,
          data: usuario.codigoRecuperacion,
        });
      } else {
        return res.status(400).json({
          status: 'error',
          msg: 'usuario no existe',
          code: 400,
          data: null,
        });
      }
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async login(req, res, next) {
    passport.authenticate('local-signup', async (err, user, info) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          msg: 'Error interno del servidor',
          code: 500,
          error: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          status: 'error',
          msg: 'Error interno del servidor',
          code: 401,
        });
      }
      const emailEnviado = userController.enviarEmailValidarEmail(user.id, user.email);
      if (emailEnviado) {
        return res.status(200).json({
          status: 'success',
          msg: 'Usuario creado con éxito',
          code: 200,
          data: user,
        });
      } else {
        return res.status(500).json({
          status: 'error',
          msg: 'Error interno del servidor',
          code: 500,
          error: err.message,
        });
      }
    });
  }

  async validarEmail(req, res) {
    try {
      const id = req.params.id;
      const codigo = req.params.codigo;
      const usuario = await userService.getOne(id);
      if (usuario?.codigoValidacion === codigo) {
        usuario.emailValidado = true;
        usuario.codigoValidacion = null;
        await usuario.save();
        return res.status(200).json({
          status: 'sucess',
          msg: 'user validado',
          code: 200,
          data: usuario,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'incorrect code',
          code: 200,
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }
}

export const userController = new UserController();
