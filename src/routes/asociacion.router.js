import express from 'express';
import { asociacionController } from '../controllers/asociacion.controller.js';
export const RouterAsociacion = express.Router();

RouterAsociacion.get('/', asociacionController.getAllController);

RouterAsociacion.get('/evento/:id', asociacionController.getAllInEventController);

RouterAsociacion.get('/:id', asociacionController.getOneController);

RouterAsociacion.post('/evento/:eventoId/asociar/:puestoId/:consumidorId', asociacionController.createOneController);

RouterAsociacion.post('/evento/:eventoId/asociarSimple/:puestoId/:consumidorId', asociacionController.createSimpleOneController);

RouterAsociacion.get('/rechazar', asociacionController.rechazarController);

RouterAsociacion.get('/aceptar', asociacionController.aceptarController);

