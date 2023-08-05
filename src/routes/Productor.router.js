import express from 'express';
export const RouterProductor = express.Router();
import { Productor } from '../DAO/models/Productor.model.js';
import { productorController } from '../controllers/productor.controller.js';

RouterProductor.get('/', productorController.getAllController);

RouterProductor.get('/:id', productorController.getOneController);

RouterProductor.put('/:id', productorController.updateOneController);

RouterProductor.post('/', productorController.createOneController);

RouterProductor.delete('/:id', productorController.deleteOneController);
