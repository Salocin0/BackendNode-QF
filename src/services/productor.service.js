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

  async update(id, razonSocial, cuit) {
    const productor = Productor.findByPk(id);
    productor.razonSocial = razonSocial;
    productor.cuit = cuit;
    await productor.save();
    return productor;
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
