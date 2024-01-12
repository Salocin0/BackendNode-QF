import { userService } from '../services/users.service.js';

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
      const usuario = req.body;
      const consumidor = req.body;
      const productor = req.body;
      const encargado = req.body;
      const repartidor = req.body;
      const usuariocreado = await userService.register(usuario, consumidor, productor, encargado, repartidor);
      if (usuariocreado) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'user created',
          data: usuariocreado,
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
  //esto esta mal separado
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
}

export const userController = new UserController();
