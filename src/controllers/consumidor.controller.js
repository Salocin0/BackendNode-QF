import { consumidorService } from "../services/consumidor.service";

class ConsumidorController{
    async getAllcontroller(req,res){
        try {
            const consumidores = await consumidorService.getAll({ include: [EncargadosPuestos, Productores /*,Repartidores*/] });
            if (consumidores.length > 0) {
              return res.status(200).json({
                status: 'sucess',
                msg: 'Found all consumidores',
                data: consumidores,
              });
            } else {
              return res.status(404).json({
                status: 'Error',
                msg: 'consumidores not found',
                data: {},
              });
            }
          } catch (e) {
            return res.status(500).json({
              status: 'error',
              msg: 'something went wrong :(',
              data: {},
            });
          }
    }
}

export const consumidorController = new ConsumidorController();