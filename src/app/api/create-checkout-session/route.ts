import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '@/lib/stripe';

const stripe = new Stripe(getStripeSecretKey());

export async function POST(request: Request) {
  try {
    const { priceId, userEmail } = await request.json();
    
    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/pricing`,
      customer_email: userEmail,
      metadata: {
        priceId,
      },
      allow_promotion_codes: true,
      subscription_data: {
        // Optional: Add trial period if needed
        // trial_period_days: 7,
        metadata: {
          // Add any subscription metadata you need
        },
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Error creating checkout session:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    const details = process.env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined;
    return NextResponse.json(
      {
        error: {
          message,
          details
        }
      },
      { status: 500 }
    );
  }
}
