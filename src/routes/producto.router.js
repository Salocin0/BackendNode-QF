import express from 'express';
import { productoController } from '../controllers/producto.controller.js';
export const RouterProducto = express.Router();

RouterProducto.get('/', productoController.getAllController);

RouterProducto.get('/:id/deshabilitados', productoController.getAllControllerDeshabilitados);

RouterProducto.get('/:id', productoController.getOneController);

RouterProducto.put('/:id', productoController.updateOneController);

RouterProducto.put('/:id/habilitar', productoController.updateOneControllerNuevamente);

RouterProducto.post('/', productoController.createOneController);

RouterProducto.delete('/:id', productoController.deleteOneController);