import express from 'express';
export const RouterPuesto = express.Router();
import { puestoController } from '../controllers/puesto.controller.js';

RouterPuesto.get('/', puestoController.getAllController);

RouterPuesto.get('/:id', puestoController.getOneController);

RouterPuesto.put('/:id', puestoController.updateOneController);

RouterPuesto.post('/', puestoController.createOneController);

RouterPuesto.delete('/:id', puestoController.deleteOneController);