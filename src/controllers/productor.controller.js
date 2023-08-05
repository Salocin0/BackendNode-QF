import { productorService } from "../services/productor.service.js";



class ProductorController {
    async getAllcontroller(req, res) {
      try {
        const productores = await productorService.getAll();
        if (productores.length > 0) {
          return res.status(200).json({
            status: 'sucess',
            msg: 'Found all productores',
            data: productores,
          });
        } else {
          return res.status(404).json({
            status: 'Error',
            msg: 'Productores not found',
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
  
  
  
  export const productorController = new ProductorController();