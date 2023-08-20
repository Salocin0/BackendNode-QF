class LoginController {
  async login(req, res) {
    try {
      if (req.user) {
        return res.status(200).json({
          status: 'success',
          msg: 'user login',
          code: 200,
          data: req.user,
        });
      } else {
        return res.status(401).json({
          status: 'error',
          msg: 'email o contraseña incorrecto',
          code: 1000,
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
}

export const loginController = new LoginController();

/*import { loginService } from '../services/login.service.js';

class LoginController {
  async login(req, res) {
    try {
      const { correoElectronico, contraseña } = req.body;
      let usuario = await loginService.loginUser(correoElectronico, contraseña);

      if (usuario) {
        return res.status(200).json({
          status: 'success',
          msg: 'user login',
          code: 200,
          data: usuario,
        });
      } else {
        return res.status(400).json({
          status: 'error',
          msg: 'email o contraseña incorrecto',
          code: 1000,
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
}

export const loginController = new LoginController();*/


/*import { loginService } from '../services/login.service.js';

class LoginController {
  async login(req, res) {
    try {
      const { correoElectronico, contraseña } = req.body;
      let login = loginService.login(correoElectronico, contraseña);
      if (login) {
        return res.status(200).json({
          status: 'success',
          msg: 'user login',
          code: 200,
          data: usuario,
        });
      } else {
        return res.status(400).json({
          status: 'error',
          msg: 'email o contraseña incorrecto',
          code: 1000,
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
}

export const loginController = new LoginController();*/