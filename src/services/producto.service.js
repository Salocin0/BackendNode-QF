import { Producto } from "../DAO/models/producto.model.js";
import { Puesto } from "../DAO/models/puesto.model.js";
import { puestoService } from "./puesto.service.js";

class ProductoService {
  //hacer que los metodos llamen a los service, no a los models
    async getAll(puestoId){
      const puesto = await puestoService.getOne(puestoId);
      if(puesto){
        const productos = await Producto.findAll({where: {
          puestoId: puestoId,
          estado: true
        }}); 
        return productos
      }
    }

    async getOne(id) {
        const producto = Producto.findByPk(id);
        return producto;
      }
  
    async update(id, producto) {
        const productodb = await Producto.findByPk(id);
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
        const puesto = await puestoService.getOne(nuevoProducto.puestoId)
        /*const productoendb = await Producto.findOne({
          where: {
            nombre: nuevoProducto.nombre,        
            descripcion: nuevoProducto.descripcion,
            stock: nuevoProducto.stock,
            img: "1",
            precio: nuevoProducto.precio,
            estado: true,
            //tipoProducto: tipoProducto,
            puestoId: 1
          },
        });*/
        //nuevoProducto.puestoId = puesto.puestoId;
        //if (productoendb) {
        //  return false;
        //} else {
          const productoCreado = await Producto.create(nuevoProducto);
          return productoCreado;
        //}
      }

    async delete(id) {
        const producto = await Producto.findByPk(id);
        producto.estado = false;
        await producto.save();
    }

}

export const productoService = new ProductoService();