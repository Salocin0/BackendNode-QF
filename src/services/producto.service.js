import { Producto } from "../DAO/models/producto.model.js";
import { Puesto } from "../DAO/models/puesto.model.js";
import { puestoService } from "./puesto.service.js";

class ProductoService {
  //hacer que los metodos llamen a los service, no a los models
    async getAll(puestoId){
      const puesto = await Puesto.findByPk(puestoId);
      const productos = await Producto.findAll({where: {
        puestoId: puesto.puestoId,
        estado: true
      }}); 
      return productos
    }

    async getOne(id) {
        const producto = Producto.findByPk(id);
        return producto;
      }
  
    async update(id, producto) {
        const productodb = await Producto.findByPk(id);
        console.log(producto)
        productodb.nombreProducto = producto.nombreProducto;  
        productodb.descripcion = producto.descripcion;
        productodb.stock = producto.stock;
        productodb.img = producto.img;
        productodb.precio = producto.precio;  
        productodb.estado = producto.estado;
        productodb.tipoProducto = producto.tipoProducto;
        await productodb.save();
        return productodb;
    }

    async create(nuevoProducto) {
        const puesto = await puestoService.getOne(nuevoProducto.puestoId)
        const productoendb = await Producto.findOne({
          where: {
            nombreProducto: nuevoProducto.nombreProducto,        
            descripcion: descripcion,
            stock: stock,
            img: img,
            precio: precio,
            estado: estado,
            tipoProducto: tipoProducto,
            puestoId: puesto.puestoId
          },
        });
        nuevoProducto.puestoId = puesto.puestoId;
        if (productoendb) {
          return false;
        } else {
          const productoCreado = await Producto.create(nuevoProducto);
          return productoCreado;
        }
      }

    async delete(id) {
        const producto = await Producto.findByPk(id);
        producto.estado = false;
        await producto.save();
    }

}

export const productoService = new ProductoService();