import { Encargado } from '../DAO/models/encargado.model.js';

class EncargadoService {
  async getAll() {
    const encargados = await Encargado.findAll();
    return encargados;
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
}

export const encargadoService = new EncargadoService();
