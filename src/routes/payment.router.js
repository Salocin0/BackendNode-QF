import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';

const PaymentRouter = express.Router();

PaymentRouter.post('/', paymentController.createPaymentSheet);

export default PaymentRouter;
