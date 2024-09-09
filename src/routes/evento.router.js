import express from 'express';
import { eventoController } from '../controllers/evento.controller.js';
export const RouterEvento = express.Router();

RouterEvento.get('/', eventoController.getAllController);

RouterEvento.get('/enEstado/:state', eventoController.getAllInStateController);

RouterEvento.get('/all', eventoController.getAllWithoutStateController);

RouterEvento.get('/:id', eventoController.getOneController);

RouterEvento.get('/dias/:id', eventoController.getDaysOneController);

RouterEvento.put('/:id', eventoController.updateOneController);

RouterEvento.put('/preparacion/:id', eventoController.updateOneControllerPreparacion);

RouterEvento.post('/', eventoController.createOneController);

RouterEvento.post('/cambiarEstado/:id/:accion', eventoController.updateStateController);

RouterEvento.delete('/:id', eventoController.deleteOneController);

RouterEvento.get('/enEstado/:state/sinAsociacionValida/:idConsumidor', eventoController.getAllInStateAndWithoutAsociacionValidaController);

RouterEvento.get('/enEstado/:state/sinAsociacionValida/:idConsumidor/puesto/:idPuesto', eventoController.getAllInStateAndWithoutAsociacionValidaPuestoController);
