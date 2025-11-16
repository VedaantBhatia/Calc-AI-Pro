import { loadStripe } from '@stripe/stripe-js';

// Use test keys in development, live keys in production
const getPublishableKey = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || '';
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
};

export const stripePromise = loadStripe(getPublishableKey());

// Helper to get the secret key (for server-side use)
export const getStripeSecretKey = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.STRIPE_SECRET_KEY_TEST!;
  }
  return process.env.STRIPE_SECRET_KEY!;
};

// Helper to get the Pro price ID (works on client and server)
export const getStripePriceId = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID_TEST || '';
  }
  return process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '';
};
