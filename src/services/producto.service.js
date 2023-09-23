import { Producto } from '../DAO/models/producto.model.js';
import { puestoService } from './puesto.service.js';

class ProductoService {
  //hacer que los metodos llamen a los service, no a los models
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
    //productodb.tipoProducto = producto.tipoProducto;
    await productodb.save();
    return productodb;
  }

  async create(nuevoProducto) {

    const productoExistente = await Producto.findOne({
      where: {
        nombre: nuevoProducto.nombre,
        puestoId: nuevoProducto.puestoId,
      },
    });

    if (productoExistente) {
      console.log("entre aca");
      return false;
    } else {
      const productoCreado = await Producto.create(nuevoProducto);
      return productoCreado;
    }
  }


  async delete(id) {
    try {
      console.log(id);
      const producto = await Producto.findByPk(id);
      console.log(producto);

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
}

export const productoService = new ProductoService();
