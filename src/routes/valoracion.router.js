import express from 'express';
import { valoracionController } from '../controllers/valoracion.controller.js';

export const RouterValoracion = express.Router();

RouterValoracion.get('/user/:idConsumidor', valoracionController.getAllByUser);

RouterValoracion.get('/puesto/:idPuesto', valoracionController.getAllByPuesto);

//RouterValoracion.get('/pedido/:idPedido', valoracionController.getAllByPedido);

RouterValoracion.post('/:idPedido', valoracionController.createOneController);

