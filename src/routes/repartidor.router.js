import express from 'express';
export const RouterRepartidor = express.Router();
import { repartidorController } from '../controllers/repartidor.controller.js';

RouterRepartidor.get('/', repartidorController.getAllController);

RouterRepartidor.get('/:id', repartidorController.getOneController);

RouterRepartidor.put('/:id', repartidorController.updateOneController);

RouterRepartidor.post('/', repartidorController.createOneController);

RouterRepartidor.delete('/:id', repartidorController.deleteOneController);
