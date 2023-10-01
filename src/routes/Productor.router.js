import express from 'express';
import { productorController } from '../controllers/productor.controller.js';
export const RouterProductor = express.Router();

RouterProductor.get('/', productorController.getAllController);

RouterProductor.get('/:id', productorController.getOneController);

RouterProductor.put('/:id', productorController.updateOneController);

RouterProductor.put('/:id/habilitacion', productorController.updateOneControllerHabilitacion)

RouterProductor.post('/', productorController.createOneController);

RouterProductor.delete('/:id', productorController.deleteOneController);
