import express, { Router } from 'express';
import { carritoController } from '../controllers/carrito.controller.js';
export const RouterCarrito = express.Router();

RouterCarrito.get('/', carritoController.getController);

RouterCarrito.get('/estructura',carritoController.getEstructuraController)

RouterCarrito.delete('/', carritoController.deleteOneController);

RouterCarrito.put('/addToCart/:productoId',carritoController.addToCartController);

RouterCarrito.put('/removeToCart/:productoId',carritoController.removeToCartController);

RouterCarrito.put('/deleteProductToCart/:productoId',carritoController.deletoToCartController);

RouterCarrito.put('/deleteProductsToCart/:puestoId',carritoController.deleteProductsToCartController);