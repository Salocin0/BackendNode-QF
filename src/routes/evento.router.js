import express from 'express';
import { eventoController } from '../controllers/evento.controller.js';
export const RouterEvento = express.Router();

RouterEvento.get('/', eventoController.getAllController);

RouterEvento.get('/enEstado/:state', eventoController.getAllInStateController);

RouterEvento.get('/all', eventoController.getAllWithoutStateController);

RouterEvento.get('/:id', eventoController.getOneController);

RouterEvento.put('/:id', eventoController.updateOneController);

RouterEvento.post('/', eventoController.createOneController);

RouterEvento.delete('/:id', eventoController.deleteOneController);
