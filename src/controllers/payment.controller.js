import * as paymentService from '../services/payment.service.js';

export const createPaymentSheet = async (req, res) => {
  const { amount } = req.body;

  try {
    const { paymentIntent, ephemeralKey, customer } = await paymentService.createPaymentSheet(amount);
    res.json({
      paymentIntent,
      ephemeralKey,
      customer,
    });
  } catch (error) {
    console.error('Error al crear el Payment Intent:', error);
    res.status(500).json({ error: error.message });
  }
};
