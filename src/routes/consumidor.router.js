import express from 'express';
export const RouterConsumidor = express.Router();
import { consumidorController } from '../controllers/consumidor.controller.js';

RouterConsumidor.get('/', consumidorController.getAllController);

RouterConsumidor.get('/:id', consumidorController.getOneController);

RouterConsumidor.put('/:id', consumidorController.updateOneController);
