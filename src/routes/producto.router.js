import express from 'express';
export const RouterProducto = express.Router();
import { productoController } from '../controllers/producto.controller.js';

RouterProducto.get('/', productoController.getAllController);

RouterProducto.get('/:id', productoController.getOneController);

RouterProducto.put('/:id', productoController.updateOneController);

RouterProducto.post('/', productoController.createOneController);

RouterProducto.delete('/:id', productoController.deleteOneController);