import express from 'express';
import { restriccionController } from '../controllers/restriccion.controller.js';
export const RouterRestriccion = express.Router();

RouterRestriccion.get('/', restriccionController.getAllController);

RouterRestriccion.get('/evento/:id', restriccionController.getAllInEventController);

RouterRestriccion.get('/:id', restriccionController.getOneController);

RouterRestriccion.post('/', restriccionController.createOneController);

RouterRestriccion.delete('/:id', restriccionController.deleteOneController);
