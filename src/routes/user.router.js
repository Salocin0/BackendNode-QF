import express from 'express';
export const RouterUser = express.Router();
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { createHash } from 'crypto';
import { sendEmail } from '../util/emailSender.js';

RouterUser.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
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

RouterUser.post('/', async (req, res) => {
  try {
    const { consumidor } = req.body;
    const usuariorepetido = await Usuario.findOne({
      where: {
        email: consumidor.usuario.correoElectronico
      },
    });
    if(usuariorepetido){
      return res.status(400).json({
        status: 'error',
        msg: 'user already added',
        code: 300,
        data: { },
      });
    }else{
      const user = {
        contraseña: consumidor.usuario.contraseña,
        usuario: consumidor.usuario.nombreDeUsuario,
        email: consumidor.usuario.correoElectronico,
        fechaAlta: Date.now(),
      };
      const usuarioCreado = await Usuario.create(user);
      console.log(usuarioCreado);
      const consum = {
        nombre: consumidor.nombre,
        apellido: consumidor.apellido,
        dni: consumidor.dni,
        localidad: consumidor.localidad,
        telefono: consumidor.telefono,
        fechaNacimiento: consumidor.fechaDeNacimiento,
        usuarioId: usuarioCreado.id,
      };
      const consumidorCreado = await Consumidor.create(consum);
      return res.status(201).json({
        status: 'success',
        msg: 'user created',
        code: 200,
        data: { usuarioCreado, consumidorCreado },
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      code:400,
      data: {},
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
      const hash = createHash('sha256')
        .update(correoElectronico + Date.now().toString())
        .digest('hex');
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
      usuario.contraseña = contraseña;
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
