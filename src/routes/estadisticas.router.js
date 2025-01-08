import express from 'express';
export const RouterEstadisticas = express.Router();
import { estadisticasController } from '../controllers/estadisticas.controller.js';

RouterEstadisticas.get('/total-recaudado-por-puesto-en-evento/:id', estadisticasController.getTotalRecaudadoPorPuestoEnEvento);
RouterEstadisticas.get('/total-recaudado-evento/:id', estadisticasController.getTotalRecaudadoEvento);
RouterEstadisticas.get('/pedidos-por-tiempo-y-carrito/:id', estadisticasController.getPedidosPorTiempoYCarrito);
