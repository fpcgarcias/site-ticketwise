import { loadStripe } from '@stripe/stripe-js';
import { products } from '../stripe-config';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(priceId: string, mode: 'payment' | 'subscription') {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      price_id: priceId,
      success_url: `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/pricing`,
      mode,
    }),
  });

  const { sessionId, url, error } = await response.json();

  if (error) {
    throw new Error(error);
  }

  if (url) {
    window.location.href = url;
    return;
  }

  const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

  if (stripeError) {
    throw new Error(stripeError.message);
  }
}

export function getProductByPriceId(priceId: string) {
  return Object.values(products).find((product) => product.priceId === priceId);
}