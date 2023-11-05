import express from 'express';
import { asociacionController } from '../controllers/asociacion.controller.js';
export const RouterAsociacion = express.Router();

RouterAsociacion.get('/', asociacionController.getAllController);

RouterAsociacion.get('/evento/:id', asociacionController.getAllInEventController);

RouterAsociacion.get('/:id', asociacionController.getOneController);

RouterAsociacion.post('/', asociacionController.createOneController);

RouterAsociacion.get('/rechazar', asociacionController.rechazarController);

RouterAsociacion.get('/aceptar', asociacionController.aceptarController);

