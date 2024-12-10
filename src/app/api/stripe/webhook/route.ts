import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  console.log('Webhook endpoint hit at:', new Date().toISOString());
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    console.log('Received webhook request');
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

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
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted' ||
        event.type === 'customer.subscription.canceled') {
      console.log('Processing subscription event');
      
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription metadata:', subscription.metadata);
      console.log('Subscription status:', subscription.status);

      const { creatorId, subscriberId } = subscription.metadata;
      
      if (!creatorId || !subscriberId) {
        console.error('Missing metadata in subscription:', subscription.metadata);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      console.log('Updating subscription in database:', {
        id: subscription.id,
        creator_id: creatorId,
        subscriber_id: subscriberId,
        status: subscription.status
      });

      // Update subscription status in database
      const { error } = await supabase.from('subscriptions').upsert({
        id: subscription.id,
        creator_id: creatorId,
        subscriber_id: subscriberId,
        status: (event.type === 'customer.subscription.deleted' || 
                event.type === 'customer.subscription.canceled') ? 'cancelled' : subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_subscription_id: subscription.id,
      });

      if (error) {
        console.error('Error updating subscription in database:', error);
      } else {
        console.log('Successfully updated subscription in database');
      }
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