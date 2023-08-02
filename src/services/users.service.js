import { Usuario } from '../DAO/models/users.model.js';

class UserService {
    async getAll(){
      const usuarios = await Usuario.findAll(); 
      return usuarios
    }
}

export const userService = new UserService();
