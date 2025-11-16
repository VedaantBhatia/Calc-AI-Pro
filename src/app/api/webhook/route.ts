import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { getStripeSecretKey } from '@/lib/stripe';

const stripe = new Stripe(getStripeSecretKey());
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const email = session.customer_email || session.customer_details?.email;

        if (!email) {
          console.error('❌ No email found in checkout session');
          break;
        }

        // Find or create user
        const user = await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: session.customer_details?.name || null,
          },
          update: {},
        });

        // Get subscription details
        const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
        const subscriptionData = subscriptionResponse as unknown as {
          id: string;
          status: string;
          current_period_end: number;
        };

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

        console.log(`✅ Checkout session completed for ${email}`);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscriptionObj = event.data.object as unknown as {
          id: string;
          status: string;
          current_period_end: number;
        };

        // Update subscription in database
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionObj.id },
          data: {
            status: subscriptionObj.status,
            currentPeriodEnd: new Date(subscriptionObj.current_period_end * 1000),
            updatedAt: new Date(),
          },
        });

        console.log(`✅ Subscription ${event.type}: ${subscriptionObj.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as canceled
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'canceled',
            updatedAt: new Date(),
          },
        });

        console.log(`✅ Subscription canceled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as {
          id: string;
          subscription?: string;
        };
        const subscriptionId = invoice.subscription;

        // Update subscription period end
        if (subscriptionId) {
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionData = subscriptionResponse as unknown as {
            id: string;
            status: string;
            current_period_end: number;
          };

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionData.id },
            data: {
              status: subscriptionData.status,
              currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
              updatedAt: new Date(),
            },
          });
        }

        console.log(`✅ Invoice payment succeeded: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as {
          id: string;
          customer: string;
          subscription?: string;
        };
        const customerId = invoice.customer;

        // Update subscription status to past_due
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: 'past_due',
              updatedAt: new Date(),
            },
          });
        }

        console.error(`❌ Invoice payment failed: ${invoice.id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Error processing webhook: ${message}`);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
