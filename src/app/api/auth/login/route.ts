import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ApiError } from '@/types/error';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, session: data.session });
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: err.status || 500 }
    );
  }
}