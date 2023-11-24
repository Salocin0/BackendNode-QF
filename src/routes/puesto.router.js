import express from 'express';
import { puestoController } from '../controllers/puesto.controller.js';
export const RouterPuesto = express.Router();

RouterPuesto.get('/', puestoController.getAllController);

RouterPuesto.get('/consultar/:id', puestoController.getOneController);

RouterPuesto.get('/evento/:eventoId', puestoController.getAllInEventController);

RouterPuesto.get('/deshabilitados', puestoController.getAllControllerDeshabilitados);

RouterPuesto.get('/creados', puestoController.getAllControllerByEncargado   );

RouterPuesto.put('/:id', puestoController.updateOneController);

RouterPuesto.put('/:id/habilitacion', puestoController.updateOneControllerHabilitacion);

RouterPuesto.post('/cambiarEstado/:id/:accion', puestoController.updateStateController);


RouterPuesto.post('/', puestoController.createOneController);

RouterPuesto.delete('/:id', puestoController.deleteOneController);
