// notificaciones.router.js

import express from 'express';
import { notificacionController } from '../controllers/notificaciones.controller.js';
export const RouterNotificacion = express.Router();


RouterNotificacion.post('/', notificacionController.enviarNotificacion);


