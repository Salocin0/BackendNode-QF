import { Productor } from '../DAO/models/productor.model.js';

class ProductorService {
  async getAll() {
    const productores = await Productor.findAll();
    return productores;
  }

  async getOne(id) {
    const productor = Productor.findByPk(id);
    return productor;
  }

  async updateOne(id, newData) {

    console.log("New data" + newData.razonSocialPE);
    console.log("New data" + newData.cuitPE)

    try {
      const productor = await Productor.findByPk(id);
      console.log(productor.cuit);
      console.log(productor.razonSocial);


      if (!productor) {
        return null;
      } else {
        productor.razonSocial = newData.razonSocialPE;
        productor.cuit = newData.cuitPE;

      }

      await productor.save();

      console.log("Actualizado" + productor.cuit + " " + productor.razonSocial);

      return productor;
    } catch (error) {
      throw error;
    }
  }

  async create(nuevoProductor) {
    const productorendb = await Productor.findOne({
      where: {
        razonSocial: nuevoProductor.razonSocial,
        cuit: nuevoProductor.cuit,
      },
    });
    if (productorendb) {
      return false;
    } else {
      const productorCreado = await Productor.create(nuevoProductor);
      return productorCreado;
    }
  }
  async deleteOne(id) {
    try {
      const productor = await Productor.findByPk(id);

      if (!productor) {
        return null; // El encargado no existe
      }

      productor.habilitado = 0;

      await productor.save();

      console.log(`Productor deshabilitado con ID: ${id}`);

      return productor;
    } catch (error) {
      throw error;
    }
  }

  async existeProductorRazonSocial(razonSocial) {
    const productor = await Productor.findOne({
      where: {
        razonSocial: razonSocial,
      },
    });
    if(productor){
      return true;
    }else{
      return false;
    }
  }

}

export const productorService = new ProductorService();
