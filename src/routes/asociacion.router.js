import express from 'express';
import { asociacionController } from '../controllers/asociacion.controller.js';
export const RouterAsociacion = express.Router();

RouterAsociacion.get('/', asociacionController.getAllController);

RouterAsociacion.get('/evento/:id', asociacionController.getAllInEventController);

RouterAsociacion.get('/:id', asociacionController.getOneController);

RouterAsociacion.get('/evento/:eventoId/asociarSimple/:puestoId/:consumidorId', asociacionController.createSimpleOneController);

RouterAsociacion.get('/buscar/:consumidorId', asociacionController.getAllByConsumidorId);

RouterAsociacion.post('/evento/:eventoId/asociar/:puestoId/:consumidorId', asociacionController.createOneController);

RouterAsociacion.post('/evento/:eventoId/asociarSimple/:puestoId/:consumidorId', asociacionController.createAsociacion);

RouterAsociacion.get('/rechazar/:id', asociacionController.rechazarController);

RouterAsociacion.get('/aceptar/:id', asociacionController.aceptarController);

RouterAsociacion.get('/cancelar/:id', asociacionController.cancelarController);

RouterAsociacion.post('/cambiarEstado/:asociacionId/:accion', asociacionController.updateStateController);
