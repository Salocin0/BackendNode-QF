import { Encargado } from '../DAO/models/encargado.model.js';
import { Usuario } from '../DAO/models/users.model.js';

class EncargadoService {
  async getAll() {
    const encargados = await Encargado.findAll();
    return encargados;
  }

  async getOne(id) {
    const encargado = await Encargado.findOne({
      where: {
        id: id,
      },
    });
    return encargado;
  }

  async getOneByRazonSocial(razonSocial) {
    const encargado = await Encargado.findOne({
      where: {
        razonSocial: razonSocial,
      },
    });
    return encargado;
  }

  async create(nuevoEncargado) {
    const encargadoendb = await Encargado.findOne({
      where: {
        razonSocial: nuevoEncargado.razonSocial,
        cuit: nuevoEncargado.cuit,
      },
    });
    if (encargadoendb) {
      return false;
    } else {
      const encargadoCreado = await Encargado.create(nuevoEncargado);
      return encargadoCreado;
    }
  }

  async updateOne(id, newData) {
    console.log('New data' + newData.razonSocialEPC);
    console.log('New data' + newData.cuitEPC);

    try {
      const encargado = await Encargado.findByPk(id);
      console.log(encargado.cuit);
      console.log(encargado.razonSocial);

      if (!encargado) {
        return null;
      } else {
        encargado.razonSocial = newData.razonSocialEPC;
        encargado.cuit = newData.cuitEPC;
      }

      await encargado.save();

      console.log('Actualizado' + encargado.cuit + ' ' + encargado.razonSocial);

      return encargado;
    } catch (error) {
      throw error;
    }
  }

  async updateOneHabilitacion(idEncargado, idUser) {
    const encargado = await Encargado.findByPk(idEncargado);
    const usuario = await Usuario.findByPk(idUser);

    console.log(encargado);
    if (encargado) {
      encargado.habilitado = true;
      await encargado.save();
      usuario.tipoUsuario = 'encargado';
      await usuario.save();

      return encargado;
    } else {
      console.log('No lo encontre');
      return null;
    }
  }

  async deleteOne(idEncargado, idUser) {
    try {
      const encargado = await Encargado.findByPk(idEncargado);
      const usuario = await Usuario.findByPk(idUser);

      if (!encargado) {
        return null;
      }

      encargado.habilitado = 0;

      await encargado.save();

      usuario.tipoUsuario = 'consumidor';
      await usuario.save();

      console.log(`Encargado deshabilitado con ID: ${idEncargado}`);

      return encargado;
    } catch (error) {
      throw error;
    }
  }

  async existeEncargadoRazonSocial(razonSocial) {
    const encargado = await Encargado.findOne({
      where: {
        razonSocial: razonSocial,
      },
    });
    if (encargado) {
      return true;
    } else {
      return false;
    }
  }
}

export const encargadoService = new EncargadoService();
