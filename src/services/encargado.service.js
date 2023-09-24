import { Encargado } from '../DAO/models/encargado.model.js';

class EncargadoService {
  async getAll() {
    const encargados = await Encargado.findAll();
    return encargados;
  }

  async getOne(id){
    const encargado = await Encargado.findOne({
      where: {
        id : id,
      }
    })
    return encargado
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

    console.log("New data" + newData.razonSocialEPC);
    console.log("New data" + newData.cuitEPC)

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

      console.log("Actualizado" + encargado.cuit + " " + encargado.razonSocial);

      return encargado;
    } catch (error) {
      throw error;
    }
  }


  async deleteOne(id) {
    try {
      const encargado = await Encargado.findByPk(id);

      if (!encargado) {
        return null; // El encargado no existe
      }

      encargado.habilitado = 0;

      await encargado.save();

      console.log(`Encargado deshabilitado con ID: ${id}`);

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
    if(encargado){
      return true;
    }else{
      return false;
    }
  }
}

export const encargadoService = new EncargadoService();
