import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const [{ count: creatorCount }, { count: supporterCount }, { data: earnings }] = await Promise.all([
      // Count creators
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('subscription_price', 0),
      
      // Count supporters
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('subscription_price', null),
      
      // Sum transactions
      supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
    ]);

    const totalEarnings = earnings?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    return NextResponse.json({
      creatorCount: creatorCount || 0,
      supporterCount: supporterCount || 0,
      totalEarnings
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
} 