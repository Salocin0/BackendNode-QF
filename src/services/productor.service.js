import { Productor } from '../DAO/models/Productor.model.js';

class ProductorService {
    async getAll(){
      const productores = await Productor.findAll(); 
      return productores
    }
}

export const productorService = new ProductorService();
