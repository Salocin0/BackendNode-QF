import express from 'express';
export const RouterEvento = express.Router();
import { eventoController } from '../controllers/evento.controller.js';

RouterEvento.get('/', eventoController.getAllController);

RouterEvento.get('/enEstado/:state', eventoController.getAllInStateController);

RouterEvento.get('/:id', eventoController.getOneController);

RouterEvento.put('/:id', eventoController.updateOneController);

RouterEvento.post('/', eventoController.createOneController);

RouterEvento.delete('/:id', eventoController.deleteOneController);
