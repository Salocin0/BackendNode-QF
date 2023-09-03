import { Repartidor } from "../DAO/models/repartidor.model.js";

class RepartidorService {
  //ACTUALIZAR METODOS CON LOS NUEVOS ATRIBUTOS DE REPARTIDOR
    async getAll(){
      const repartidores = await Repartidor.findAll(); 
      return repartidores
    }

    async getOne(id) {
        const repartidor = Repartidor.findByPk(id);
        return repartidor;
      }
  
      // Atributos del repartidor
      async updateOne(id, repartidorData) {
        const repartidor = await Repartidor.findByPk(id);

        if (repartidor) {
          repartidor.razonSocial = repartidorData.razonSocial;
          repartidor.cuit = repartidorData.cuit;

          await repartidor.save();

          return repartidor;
        } else {
          console.log("No lo encontre")
          return null;
        }
      }
    async create(nuevorepartidor) {
        const repartidorendb = await Repartidor.findOne({
          where: {
            // Algun atributo del repartidor
            cuit: nuevorepartidor.cuit,
          },
        });
        if (repartidorendb) {
          return false;
        } else {
          const repartidorCreado = await Repartidor.create(nuevorepartidor);
          return repartidorCreado;
        }
      }

    async delete(id) {
        const repartidor = await Repartidor.findByPk(id);
        repartidor.habilitado = false;
        await repartidor.save();
    }

}

export const repartidorService = new RepartidorService();