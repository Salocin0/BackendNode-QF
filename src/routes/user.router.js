import express from 'express';
export const RouterUser = express.Router();
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { createHash } from 'crypto';
import { sendEmail } from '../util/emailSender.js';
import flash from 'connect-flash';
import { createHashPW } from '../util/bcrypt.js';
import { userController } from '../controllers/users.controller.js';
import { userService } from '../services/users.service.js';
import passport from 'passport';

RouterUser.get('/', userController.getAllcontroller);



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

RouterUser.post('/', passport.authenticate('local-signup', { failureRedirect: '/user/fail/register', failureFlash: true }), async (req, res) => {
  try {
    return res.status(201).json({
      status: 'success',
      msg: 'user created',
      code: 200,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      code: 400,
      data: { e },
    });
  }
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
        data: null,
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

/* TO DO
  RouterUser.delete("/:cid", async (req, res) => {
    try {
      const cid = req.params.cid;
      let products = new Array();
      const cart = await cartService.updateCart(cid,products);
      return res.status(200).json({
        status: 'success',
        msg: 'products deleted in cart',
        data: cart,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  });*/

/* TO DO
  RouterUser.put("/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;
      const cart = await cartService.updateCart(cid,products);
      return res.status(200).json({
        status: 'success',
        msg: 'product in cart updated',
        data: cart,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  });
  */
