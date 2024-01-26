import { Producto } from '../DAO/models/producto.model.js';
import { puestoService } from './puesto.service.js';

class ProductoService {
  async getAll(puestoId) {
    const puesto = await puestoService.getOne(puestoId);
    if (puesto) {
      const productos = await Producto.findAll({
        where: {
          puestoId: puestoId,
          estado: true,
        },
      });
      return productos;
    }
  }

  async getAllDeshabilitados(puestoId) {
    const puesto = await puestoService.getOne(puestoId);
    if (puesto) {
      const productos = await Producto.findAll({
        where: {
          puestoId: puestoId,
          estado: false,
        },
      });
      return productos;
    }
  }

  async getOne(id) {
    const producto = Producto.findByPk(id);
    return producto;
  }

  async update(id, producto) {
    const productodb = await Producto.findByPk(id);
    if (!productodb) {
      return null;
    }
    productodb.nombre = producto.nombre;
    productodb.descripcion = producto.descripcion;
    productodb.stock = producto.stock;
    productodb.img = producto.img;
    productodb.precio = producto.precio;
    productodb.estado = producto.estado;
    await productodb.save();
    return productodb;
  }

  async updateNuevamente(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) {
        return null;
      }
      producto.estado = true;
      await producto.save();
      return producto;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(nuevoProducto) {
    const productoExistente = await Producto.findOne({
      where: {
        nombre: nuevoProducto.nombre,
        puestoId: nuevoProducto.puestoId,
      },
    });
    if (productoExistente) {
      return false;
    } else {
      const productoCreado = await Producto.create(nuevoProducto);
      return productoCreado;
    }
  }

  async delete(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) {
        return null;
      }
      producto.estado = false;
      await producto.save();
      return producto;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletePermanently(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) {
        return null;
      }
      await producto.destroy();
      return producto;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const productoService = new ProductoService();
