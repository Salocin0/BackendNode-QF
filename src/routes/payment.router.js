import express from 'express';
import { createCartCheckout, resumeCartCheckout, completeCartCheckout } from '../controllers/cartCheckout.controller.js';
import * as paymentController from '../controllers/payment.controller.js';

const PaymentRouter = express.Router();

PaymentRouter.post('/cart', createCartCheckout);
PaymentRouter.get('/cart/:id', resumeCartCheckout);
PaymentRouter.post('/cart/:id/complete', completeCartCheckout);

PaymentRouter.post('/', paymentController.createPaymentSheet);

export default PaymentRouter;
