// notificaciones.router.js

import express from 'express';
import { notificacionController } from '../controllers/notificaciones.controller.js';
export const RouterNotificacion = express.Router();


RouterNotificacion.post('/', notificacionController.enviarNotificacion);

RouterNotificacion.get('/web', notificacionController.getNotificacionesweb);

RouterNotificacion.get('/mobile', notificacionController.getNotificacionesmobile);

RouterNotificacion.put('/:id', notificacionController.CambiarNotificacionAVista);


