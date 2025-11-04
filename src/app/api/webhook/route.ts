import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription ${event.type}:`, subscription.id);
      
      // Get customer email
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
      
      // Find or create user in database
      const { data: users } = await client.models.User.list({
        filter: { email: { eq: customer.email || '' } },
      });

      const subscriptionStatus = subscription.status === 'active' ? 'active' : 
                                 subscription.status === 'canceled' ? 'cancelled' : 'past_due';

      const currentPeriodEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date().toISOString();

      if (users && users.length > 0) {
        // Update existing user
        await client.models.User.update({
          id: users[0].id,
          stripeCustomerId: customer.id,
          subscriptionId: subscription.id,
          subscriptionStatus,
          subscriptionPriceId: subscription.items.data[0]?.price.id,
          subscriptionCurrentPeriodEnd: currentPeriodEnd,
        });
      } else {
        // Create new user record
        await client.models.User.create({
          email: customer.email || '',
          stripeCustomerId: customer.id,
          subscriptionId: subscription.id,
          subscriptionStatus,
          subscriptionPriceId: subscription.items.data[0]?.price.id,
          subscriptionCurrentPeriodEnd: currentPeriodEnd,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription deleted:', subscription.id);
      
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
      
      // Update user subscription status
      const { data: users } = await client.models.User.list({
        filter: { email: { eq: customer.email || '' } },
      });

      if (users && users.length > 0) {
        await client.models.User.update({
          id: users[0].id,
          subscriptionStatus: 'cancelled',
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment succeeded:', invoice.id);
      // Subscription is already active from subscription.updated event
      break;
    }

    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log('Payment failed:', failedInvoice.id);
      
      if (failedInvoice.customer_email) {
        const { data: users } = await client.models.User.list({
          filter: { email: { eq: failedInvoice.customer_email } },
        });

        if (users && users.length > 0) {
          await client.models.User.update({
            id: users[0].id,
            subscriptionStatus: 'past_due',
          });
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
