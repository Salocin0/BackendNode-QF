import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { Usuario } from '../DAO/models/users.model.js';
class RepartidorService {
  //ACTUALIZAR METODOS CON LOS NUEVOS ATRIBUTOS DE REPARTIDOR
  async getAll() {
    const repartidores = await Repartidor.findAll();
    return repartidores;
  }

  async getOne(id) {
    const repartidor = Repartidor.findByPk(id);
    return repartidor;
  }

  // Atributos del repartidor
  async updateOne(idRepartidor , idUser) {


    const repartidor = await Repartidor.findByPk(idRepartidor);
    const usuario = await Usuario.findByPk(idUser);

    console.log(repartidor);
    if (repartidor) {
      repartidor.habilitado = true;
      await repartidor.save();
      usuario.tipoUsuario = 'repartirdor';
      await usuario.save();

      return repartidor;
    } else {
      console.log('No lo encontre');
      return null;
    }
  }
  async create(nuevorepartidor) {
    const repartidorCreado = await Repartidor.create(nuevorepartidor);
    return repartidorCreado;
  }
  async deleteOne(idRepartidor, idUser) {
    try {
      const repartidor = await Repartidor.findByPk(idRepartidor);
      const usuario = await Usuario.findByPk(idUser);

      console.log(usuario);
      console.log(idUser);

      if (!repartidor) {
        return null;
      }

      repartidor.habilitado = 0;
      usuario.tipoUsuario = 'consumidor';
      await usuario.save();
      await repartidor.save();

      console.log(`Repartidor deshabilitado con ID: ${idRepartidor}`);

      return repartidor;
    } catch (error) {
      throw error;
    }
  }

  async getRepartidorDetails(repartidorId) {
    try {
      const repartidorDetails = await Repartidor.findByPk(repartidorId);
      console.log(repartidorDetails.id);

      const repartidorDetails2 = await Consumidor.findOne({
        where: {
          repartidorId: repartidorDetails.id,
        },
      });
      return repartidorDetails2;
    } catch (error) {
      console.error("Error al obtener detalles del puesto:", error);
      throw new Error("No se pudieron obtener los detalles del puesto");
    }
  }
}

export const repartidorService = new RepartidorService();
