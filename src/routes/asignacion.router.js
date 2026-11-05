import express from 'express';
import { asignacionController } from '../controllers/asignaciones.controller.js';
export const RouterAsignaciones = express.Router();

RouterAsignaciones.get('/', asignacionController.getOneController);

RouterAsignaciones.get('/rechazar/:id', asignacionController.rechazarController);

RouterAsignaciones.get('/aceptar/:id', asignacionController.aceptarController);


// Strict variants for the web client: state-changing, require the courier header and ownership.
RouterAsignaciones.post('/:id/aceptar', asignacionController.aceptarStrictController);

RouterAsignaciones.post('/:id/rechazar', asignacionController.rechazarStrictController);
