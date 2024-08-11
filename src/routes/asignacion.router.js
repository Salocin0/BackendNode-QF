import express from 'express';
import { asignacionController } from '../controllers/asignaciones.controller.js';
export const RouterAsignaciones = express.Router();

RouterAsignaciones.get('/', asignacionController.getOneController);

RouterAsignaciones.get('/rechazar/:id', asignacionController.rechazarController);

RouterAsignaciones.get('/aceptar/:id', asignacionController.aceptarController);

