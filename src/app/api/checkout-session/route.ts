import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '@/lib/stripe';

const stripe = new Stripe(getStripeSecretKey());

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email,
    });
  } catch (err: unknown) {
    console.error('Error retrieving checkout session:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: { message } },
      { status: 500 }
    );
  }
}
