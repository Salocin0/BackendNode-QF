import { Carrito } from '../DAO/models/carrito.model.js';
import { productoService } from './producto.service.js';

class CarritoService {
  async getOne(consumidorId) {
    var carrito = await Carrito.findOne({
      where: {
        consumidorId: consumidorId,
      },
    });
    if (carrito){
        return carrito
    }else{
        carrito = Carrito.create({consumidorId: consumidorId})
        return carrito
    }
  }

  async delete(id) {
    try {
      const carrito = await this.getOne(id)
      await carrito.destroy()

      return await this.getOne(id)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addToCart(consumidorId,ProductoId) {
    try {
        const carrito = await this.getOne(consumidorId)
        carrito.agregarProducto(ProductoId,1)
        return carrito
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async removeToCart(consumidorId,ProductoId) {
    try {
        const carrito = await this.getOne(consumidorId)
        carrito.quitarUnaUnidad(ProductoId,1)
        return carrito
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletoToCart(consumidorId,ProductoId) {
    try {
        const carrito = await this.getOne(consumidorId)
        carrito.removeProducto(ProductoId,0)
        return carrito
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
}

export const carritoService = new CarritoService();
