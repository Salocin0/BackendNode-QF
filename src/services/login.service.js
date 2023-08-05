import { Usuario } from "../DAO/models/users.model.js";
import { isValidPassword } from '../util/bcrypt.js';

class LoginService {
  async loginUser(usuario, correoElectronico, contraseña) {
    let usuarioEmail = await Usuario.findOne({
      where: {
        email: correoElectronico,
      },
    });
    let usuarioUser = await Usuario.findOne({
      where: {
        usuario: correoElectronico,
      },
    });

    if (!usuarioEmail) {
      if (!usuarioUser) {
        return false;
      } else {
        usuario = usuarioUser;
      }
    } else {
      usuario = usuarioEmail;
    }

    if (isValidPassword(contraseña, usuario.contraseña)) {
      return true;
    } else {
      return false;
    }
  }
}

export const loginService = new LoginService();
