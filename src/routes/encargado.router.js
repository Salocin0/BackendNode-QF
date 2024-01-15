import express from 'express';
import { encargadoController } from '../controllers/encargado.controller.js';
export const RouterEncargado = express.Router();

RouterEncargado.get('/', encargadoController.getAllcontroller);

RouterEncargado.get('/:id', encargadoController.getOnecontroller);

RouterEncargado.put('/:id', encargadoController.updateOneController);

RouterEncargado.put('/:id/habilitacion', encargadoController.updateOneControllerHabilitacion);

RouterEncargado.post('/', encargadoController.createOneController);

RouterEncargado.delete('/:id', encargadoController.deleteOneController);
