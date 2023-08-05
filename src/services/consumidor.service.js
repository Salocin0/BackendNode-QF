import { Consumidor } from "../DAO/models/consumidor.model.js";

class ConsumidorService {
    async getAll(){
        const consumidores = await Consumidor.findAll();
        return consumidores
    }
}

export const consumidorService = new ConsumidorService();