import Stripe from 'stripe';

const stripe = new Stripe("sk_test_51PnpcMRoRlWr6LoNVHnAJMDXVOFLMlAAeTxMZUvUuWmPt4qMChWK3SYn8ZPcwE8cwg5dsEmkEIPWjlFBRzBOOpco00YLHUKBoL", { apiVersion: '2023-08-16' });

export const createPaymentSheet = async (amount) => {
  const customer = await stripe.customers.create();

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2023-08-16' }
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customer.id,
  });

  return {
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  };
};
