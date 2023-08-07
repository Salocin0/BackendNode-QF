import { Usuario } from "../DAO/models/users.model.js";
import { isValidPassword } from '../util/bcrypt.js';

class LoginService {
  async loginUser(correoElectronico, contraseña) {
    let usuario = await Usuario.findOne({
      where: {
        email: correoElectronico,
      },
    });

    if (!usuario) {
      usuario = await Usuario.findOne({
        where: {
          usuario: correoElectronico,
        },
      });
    }

    if (usuario && isValidPassword(contraseña, usuario.contraseña)) {
      return usuario;
    } else {
      return null;
    }
  }
}

export const loginService = new LoginService();
