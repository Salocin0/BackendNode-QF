import express from 'express';
import { puntoEncuentroController } from '../controllers/puntoEncuentro.controller.js';
export const RouterPuntoEncuentro = express.Router();

RouterPuntoEncuentro.get('/', puntoEncuentroController.getAllController);

RouterPuntoEncuentro.get('/:eventoId', puntoEncuentroController.getAllInEventController);

RouterPuntoEncuentro.get('/:id', puntoEncuentroController.getOneController);

RouterPuntoEncuentro.put('/:id', puntoEncuentroController.updateOneController);

RouterPuntoEncuentro.post('/', puntoEncuentroController.CreateOneController);

RouterPuntoEncuentro.delete('/:id', puntoEncuentroController.deleteOneController);
