import express from 'express';
import { valoracionController } from '../controllers/puesto.controller.js';
export const RouterValoracion = express.Router();

RouterValoracion.get('/', valoracionController.getAllController);

RouterValoracion.get('/consultar/:rol/id', valoracionController.getOneController);

RouterValoracion.post('/:id', valoracionController.createOneController);

