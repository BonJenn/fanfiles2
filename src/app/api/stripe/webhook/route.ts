import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { postId, creatorId, userId } = session.metadata!;

      // Get supabase client
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // Record the transaction
      await supabase.from('transactions').insert({
        post_id: postId,
        creator_id: creatorId,
        user_id: userId,
        amount: session.amount_total,
        stripe_session_id: session.id,
      });

      // Grant access to the content
      await supabase.from('post_access').insert({
        post_id: postId,
        user_id: userId,
      });
    }

    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const { creatorId, subscriberId } = subscription.metadata;

      // Update subscription status in database
      await supabase.from('subscriptions').upsert({
        id: subscription.id,
        creator_id: creatorId,
        subscriber_id: subscriberId,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_subscription_id: subscription.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}