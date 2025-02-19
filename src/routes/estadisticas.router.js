import express from 'express';
export const RouterEstadisticas = express.Router();
import { estadisticasController } from '../controllers/estadisticas.controller.js';

RouterEstadisticas.get('/total-recaudado-por-puesto-en-evento/:id', estadisticasController.getTotalRecaudadoPorPuestoEnEvento);
RouterEstadisticas.get('/total-recaudado-evento/:id', estadisticasController.getTotalRecaudadoEvento);
RouterEstadisticas.get('/pedidos-por-tiempo-y-carrito/:idevento/:idpuesto', estadisticasController.getPedidosPorTiempoYCarrito);
RouterEstadisticas.get('/productos-vendidos-dia-evento/:idevento/:idpuesto/:diaevento', estadisticasController.getProductosVendidosDiaEvento);
RouterEstadisticas.get('/pedidos-por-tiempo-y-carrito/:idevento', estadisticasController.getPedidosPorTiempoYCarrito);
RouterEstadisticas.get('/promedio-valoracion-puesto/:id', estadisticasController.getPromedioValoracionPuesto);
RouterEstadisticas.post('/total-recaudado-puesto-evento/:idConsumidor', estadisticasController.getTotalRecaudadoPuestoEvento);
RouterEstadisticas.post('/promedio-valoracion-puesto-evento/:idConsumidor', estadisticasController.getPromedioValoracionPuestoEvento);
RouterEstadisticas.post('/promedio-tiempo-entrega-puesto-evento/:idConsumidor', estadisticasController.getTiempoPromedioEntrega);
RouterEstadisticas.post('/top-productos-puesto-evento/:idConsumidor', estadisticasController.getTopProductosPorEventoYpuesto);
RouterEstadisticas.get('/consumidor/:idConsumidor', estadisticasController.getEstadisticasConsumidor);
RouterEstadisticas.get('/repartidor/:idConsumidor', estadisticasController.getEstadisticasRepartidor);
