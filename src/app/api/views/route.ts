import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { postId, viewerId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Get the creator_id from the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('creator_id')
      .eq('id', postId)
      .single();

    if (postError) throw postError;

    // Record the view with creator_id
    const { error } = await supabase
      .from('post_views')
      .insert([
        {
          post_id: postId,
          viewer_id: viewerId,
          creator_id: post.creator_id,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    );
  }
}