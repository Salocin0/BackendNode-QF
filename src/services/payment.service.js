import Stripe from 'stripe';

let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
  }
  return stripe;
};

export const createPaymentSheet = async (amount) => {
  const s = getStripe();
  const customer = await s.customers.create();

  const ephemeralKey = await s.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2023-08-16' }
  );

  const paymentIntent = await s.paymentIntents.create({
    amount:Math.round(amount),
    currency: 'usd',
    customer: customer.id,
  });

  return {
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  };
};
