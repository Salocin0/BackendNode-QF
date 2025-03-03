import { Carrito } from '../DAO/models/carrito.model.js';
import { Producto } from '../DAO/models/producto.model.js';
import { ItemCarrito } from '../DAO/models/itemCarrito.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { Evento } from '../DAO/models/evento.model.js';
class CarritoService {
  async getOneByConsumidorId(consumidorId) {
    let carrito = await Carrito.findOne({
      where: { consumidorId },
      include: [
        {
          model: ItemCarrito,
          include: [{model:Producto,include:Puesto},Evento],
        },
        
      ],
    });
  
    if (!carrito) {
      carrito = await Carrito.create({ consumidorId });
    }
  
    return carrito;
  }
  
  async getOneById(id) {
    let carrito = await Carrito.findOne({
      where: { id },
      include: [
        {
          model: ItemCarrito,
          include: [{model:Producto,include:Puesto},Evento],
        },
        
      ],
    });
  
    if (!carrito) {
      carrito = await Carrito.create();
    }
  
    return carrito;
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

  async deleteByPuesto(id,puestoId,fecha) {
    try {
      const productos = await Producto.findAll({
        where: {
          puestoId: puestoId,
        },
      });
      if(fecha===undefined){
        fecha=null
      }
      for (const producto of productos) {
        const itemsCarrito = await ItemCarrito.findOne({
          where: {
            carritoId: id,
            productoId: producto.id,
            fecha: fecha,
          },
        });
        if (itemsCarrito) {
          await itemsCarrito.destroy();
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addProductToCart(carritoId, productoId, eventoId, cantidad, fecha) {
    const itemsCarrito = await ItemCarrito.findOne({
      where: {
        carritoId: carritoId,
        productoId: productoId,
        eventoId: eventoId,
        fecha: fecha,
      },
    });
    if (itemsCarrito) {
      itemsCarrito.cantidad += cantidad;
      await itemsCarrito.save();
    } else {
      if (fecha) {
        ItemCarrito.create({
          carritoId: carritoId,
          productoId: productoId,
          cantidad: cantidad,
          eventoId: eventoId,
          fecha: fecha,
        });
      } else {
        ItemCarrito.create({
          carritoId: carritoId,
          productoId: productoId,
          cantidad: cantidad,
          eventoId: eventoId,
          fecha: null,
        });
      }
    }
  }

  async removeProductFromCart(carritoId, productoId, cantidad, eventoId,fecha) {
    const itemsCarrito = await ItemCarrito.findOne({
      where: {
        carritoId: carritoId,
        productoId: productoId,
        eventoId: eventoId,
        fecha: fecha,
      },
    });
    if (itemsCarrito) {
      if (itemsCarrito.cantidad > cantidad) {
        itemsCarrito.cantidad -= cantidad;
        await itemsCarrito.save();
      } else {
        await itemsCarrito.destroy();
      }
    }
  }

  async revomeAllProductFromCart(carritoId, productoId, eventoId,fecha) {
    {
      const itemsCarrito = await ItemCarrito.findOne({
        where: {
          carritoId: carritoId,
          productoId: productoId,
          eventoId: eventoId,
          fecha: fecha,
        },
      });
      if (itemsCarrito) {
        await itemsCarrito.destroy();
      }
    }
  }
}
export const carritoService = new CarritoService();
