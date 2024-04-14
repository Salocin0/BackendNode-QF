import express from 'express';
import { valoracionController } from '../controllers/valoracion.controller.js';

export const RouterValoracion = express.Router();

RouterValoracion.get('/:idConsumidor', valoracionController.getAllByUser);

RouterValoracion.get('/:idPuesto', valoracionController.getAllByPuesto);

RouterValoracion.get('/:idPedido', valoracionController.getAllByPedido);

RouterValoracion.post('/:idPedido', valoracionController.createOneController);

