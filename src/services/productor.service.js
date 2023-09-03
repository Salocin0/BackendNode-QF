import { Productor } from '../DAO/models/Productor.model.js';

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

  async delete(id) {
    const productor = await Productor.findByPk(id);
    productor.habilitado = false;
    await productor.save();
  }
}

export const productorService = new ProductorService();
