import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cancel the subscription with Stripe
    await stripe.subscriptions.cancel(subscriptionId);

    // Update the subscription status in Supabase
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', subscriptionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}