import express from 'express';
import { puestoController } from '../controllers/puesto.controller.js';
export const RouterPuesto = express.Router();

RouterPuesto.get('/', puestoController.getAllController);

RouterPuesto.get('/evento/:eventoId', puestoController.getAllInEventController);

RouterPuesto.get('/deshabilitados', puestoController.getAllControllerDeshabilitados);

RouterPuesto.get('/:id', puestoController.getOneController);

RouterPuesto.put('/:id', puestoController.updateOneController);

RouterPuesto.put('/:id/habilitacion', puestoController.updateOneControllerHabilitacion);

RouterPuesto.post('/', puestoController.createOneController);

RouterPuesto.delete('/:id', puestoController.deleteOneController);
