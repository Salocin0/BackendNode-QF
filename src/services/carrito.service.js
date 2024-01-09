import { Carrito, ItemCarrito } from '../DAO/models/carrito.model.js';
import { productoService } from './producto.service.js';
import { Producto } from '../DAO/models/producto.model.js';

class CarritoService {
  async getOne(consumidorId) {
    var carrito = await Carrito.findOne({
      where: {
        consumidorId: consumidorId,
      },
    });
    if (carrito) {
      return carrito;
    } else {
      carrito = Carrito.create({ consumidorId: consumidorId });
      return carrito;
    }
  }

  async getEstructura(consumidorId) {
    try {
      const carrito = await Carrito.findOne({
        where: {
          consumidorId: consumidorId,
        },
      });

      if (carrito) {
        const items = await ItemCarrito.findAll({
          where: {
            CarritoId: carrito.id,
          },
          include: [{ model: Producto }],
        });
        const carritoestructura = {
          id: carrito.id,
          consumidorId: carrito.consumidorId,
          productos: items.map((item) => ({
            cantidad: item.cantidad,
            nombre: item.producto.nombre,
            precio: item.producto.precio,
            id: item.producto.id,
            puestoId: item.producto.puestoId,
          })),
        };

        return carritoestructura;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener la estructura del carrito:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const carrito = await this.getOne(id);
      await carrito.destroy();

      return await this.getOne(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addToCart(consumidorId, ProductoId) {
    try {
      const carrito = await this.getOne(consumidorId);
      carrito.agregarProducto(ProductoId, 1);
      return carrito;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async removeToCart(consumidorId, ProductoId) {
    try {
      const carrito = await this.getOne(consumidorId);
      carrito.quitarProducto(ProductoId, 1);
      return carrito;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletoToCart(consumidorId, ProductoId) {
    try {
      const carrito = await this.getOne(consumidorId);
      carrito.actualizarCantidad(ProductoId, 0);
      return carrito;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletoProductsToCart(consumidorId, puestoId) {
    try {
      const carrito = await this.getOne(consumidorId);
      const items = await ItemCarrito.findAll({
        where: {
          CarritoId: carrito.id,
        },
      });

      await Promise.all(items.map(async (item) => {
        await item.destroy();
      }));
  
      return carrito;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const carritoService = new CarritoService();
