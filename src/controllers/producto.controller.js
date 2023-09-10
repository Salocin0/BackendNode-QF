import { productoService } from '../services/producto.service.js';

class ProductoController {
  async getAllController(req, res) {
    try {
      const puestoId = req.headers["puestoid"];
      const productos = await productoService.getAll(puestoId);
      if (productos) {
        return res.status(200).json({
          status: 'sucess',
          msg: 'Found all productos',
          data: productos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'productos not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getOneController(req, res) {
    try {
      const productoId = req.params.id;
      const producto = await productoService.getOne(productoId);
      if (producto !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'producto found',
          data: producto,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'producto with id ' + req.params.id + ' not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async updateOneController(req, res) {
    try {
      const id = req.params.id;
      const { producto } = req.body;
      const result = await productoService.update(id, producto);    
      return res.status(200).json({
        status: 'success',
        msg: 'producto is updated',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async createOneController(req, res) {
    try {
      const { nombre, descripcion, stock, imagen, precio, estado, tipoProducto } = req.body;
      const nuevoProducto = {
        nombre: nombre,
        descripcion: descripcion,
        stock: stock,
        img: imagen,
        precio: precio,
        estado: estado,
        //tipoProducto: tipoProducto
      };
      console.log(nuevoProducto);
      const productoCreado = await productoService.create(nuevoProducto);
      if (productoCreado === false) {
        return res.status(200).json({
          status: 'error',
          msg: 'Producto used',
          code: 400,
          data: {},
        });
      } else {
        return res.status(201).json({
          status: 'success',
          msg: 'Producto created',
          code: 200,
          data: productoCreado,
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const producto = await productoService.delete(id);
      return res.status(200).json({
        status: 'success',
        msg: 'encargado deleted',
        code: 200,
        data: producto,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

}

export const productoController = new ProductoController();