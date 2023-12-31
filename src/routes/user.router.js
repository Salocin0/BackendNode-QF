import { createHash } from 'crypto';
import express from 'express';
import passport from 'passport';
import { Usuario } from '../DAO/models/users.model.js';
import { userController } from '../controllers/users.controller.js';
import { createHashPW } from '../util/bcrypt.js';
import { sendEmail } from '../util/emailSender.js';
import { userService } from '../services/users.service.js';
export const RouterUser = express.Router();

RouterUser.get('/', userController.getAllcontroller);

RouterUser.get("/validarEmailUsuario/:id/:codigo",async (req, res) => {
  try {
    const id = req.params.id;
    const codigo = req.params.codigo;
    const usuario = await Usuario.findByPk(id);
    if (usuario?.codigoValidacion === codigo) {
      usuario.emailValidado=true;
      usuario.codigoValidacion=null;
      await usuario.save();
      return res.status(200).json({
        status: 'sucess',
        msg: 'user validado',
        code:200,
        data: usuario,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'incorrect code',
        code:200,
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
  }})

  RouterUser.get("/habilitarUsuario/:id/:codigo",async (req, res) => {
    try {
      const id = req.params.id;
      const codigo = req.params.codigo;
      console.log(id,codigo)
      const usuario = await Usuario.findByPk(id);
      if (usuario?.codigoHabilitacion === codigo) {
        usuario.habilitado=true;
        usuario.codigoHabilitacion=null;
        await usuario.save();
        return res.status(200).json({
          status: 'sucess',
          msg: 'user habilitado',
          code:200,
          data: usuario,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'incorrect code',
          code:200,
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
    }})

RouterUser.get('/fail/register', async (req, res) => {
  const errorMessage = req.flash();
  res.status(200).json({ error: errorMessage });
});

RouterUser.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const usuario = await Usuario.findByPk(userId);
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
});

RouterUser.post('/', (req, res, next) => {
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
    //enviar email
    const emailEnviado = userController.enviarEmailValidarEmail(user.id,user.email)
    if(emailEnviado){
      return res.status(200).json({
        status: 'success',
        msg: 'Usuario creado con éxito',
        code: 200,
        data: user,
      });
    }else{
      return res.status(500).json({
        status: 'error',
        msg: 'Error interno del servidor',
        code: 500,
        error: err.message,
      });
    }
   
  })(req, res, next);
});

RouterUser.put('/recuperarcontrasenia', async (req, res) => {
  try {
    const { correoElectronico } = req.body;
    const usuario = await Usuario.findOne({
      where: {
        email: correoElectronico,
      },
    });

    if (usuario !== null) {
      const hash = createHash('sha256').update(Date.now().toString()).digest('hex');
      usuario.codigoRecuperacion = hash;
      await usuario.save();
      console.log(correoElectronico);
      sendEmail(
        correoElectronico,
        'Recuperar contraseña',
        'Se solicitó un cambio de contraseña. Para cambiar tu contraseña, haz clic en el siguiente enlace: http://localhost:3000/cambiar-contrasenia/' + hash
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
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
  }
});

RouterUser.put('/recuperarcontrasenia/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { contraseña } = req.body;
    const usuario = await Usuario.findOne({
      where: {
        codigoRecuperacion: codigo,
      },
    });
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
});

  RouterUser.post('/update/:id/to/:rol',userController.updateRolController);

  RouterUser.post('/habilitar',userController.habilitar);

  RouterUser.put("/habilitar",userController.habilitarUsuario)

  RouterUser.delete("/:id",userController.deshabilitarUsuario)
