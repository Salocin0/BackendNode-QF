import { userService } from "../services/users.service.js";
class LoginController {
  async login(req, res) {
    try {
      if (req.user.emailValidado === true) {
        const sessionId = req.sessionID;
        req.session.user = {
          email: req.user.email,
          usuario: req.user.usuario,
          consumidorId: req.user.consumidoreId,
          tipoUsuario: req.user.tipoUsuario,
          id: req.user.id,
          sessionId: sessionId,
        };
        if(req.user.tokenWeb!=null || req.user.tokenMobile !=null){
          userService.setTokens(req.user.id,req.user.tokenWeb,req.user.tokenMobile)
        }
      } else {
        return res.status(200).json({
          status: 'success',
          msg: 'user login but email not valided',
          code: 300,
          data: req.session.user,
        });
      }
      if (req.user.habilitado === false) {
        return res.status(200).json({
          status: 'success',
          msg: 'user login but is not habilited',
          code: 301,
          data: req.session.user,
        });
      }
      if (req.session.user) {
        return res.status(200).json({
          status: 'success',
          msg: 'user login',
          code: 200,
          data: req.session.user,
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
