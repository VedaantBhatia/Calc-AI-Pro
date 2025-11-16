import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '@/lib/stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(getStripeSecretKey());

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return new NextResponse('Session ID is required', { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription'],
    });

    // If payment is complete, create/update subscription in database
    // This is a fallback for local development where webhooks don't work
    if (session.status === 'complete' && session.payment_status === 'paid') {
      const email = session.customer_details?.email || session.customer_email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription;

      if (email && subscriptionId) {
        try {
          // Get subscription details from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(
            typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
          );
          const subscriptionData = stripeSubscription as unknown as {
            id: string;
            status: string;
            current_period_end: number;
          };

          // Find or create user
          const user = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              name: session.customer_details?.name || null,
            },
            update: {},
          });

          // Create or update subscription
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscriptionData.id },
            update: {
              status: subscriptionData.status,
              currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionData.id,
              status: subscriptionData.status,
              currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
            },
          });

          console.log(`✅ Subscription created/updated for ${email}`);
        } catch (dbError) {
          console.error('Error creating subscription in database:', dbError);
          // Don't fail the request, just log the error
        }
      }
    }

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      subscription_id: session.subscription?.toString(),
    });
  } catch (error: unknown) {
    console.error('Error verifying session:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
