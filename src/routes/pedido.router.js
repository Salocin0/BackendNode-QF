import express from 'express';
import { pedidoController } from '../controllers/pedido.controller.js';
export const RouterPedido = express.Router();

RouterPedido.get('/', pedidoController.getAllController);

RouterPedido.get('/:id', pedidoController.getOneController);

RouterPedido.post('/', pedidoController.createOneController);
