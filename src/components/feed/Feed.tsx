'use client';

import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { FilterControls } from './FilterControls';
import { Post } from '@/types/post';
import { supabase } from '@/lib/supabase';

export type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low';
export type ContentType = 'all' | 'image' | 'video';

interface FeedProps {
  subscribedContent: boolean;
  creatorId?: string;
}

export const Feed = ({ subscribedContent, creatorId }: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('posts')
          .select(`
            *,
            creator:creator_id (
              id,
              name,
              avatar_url
            )
          `);

        // Apply creator filter if provided
        if (creatorId) {
          query = query.eq('creator_id', creatorId);
        }

        // Apply content type filter
        if (contentType !== 'all') {
          query = query.eq('type', contentType);
        }

        // Apply search filter
        if (searchQuery) {
          query = query.ilike('description', `%${searchQuery}%`);
        }

        // Apply subscription filter
        if (subscribedContent) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            query = query.eq('creator_id', user.id);
          }
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'price_high':
            query = query.order('price', { ascending: false });
            break;
          case 'price_low':
            query = query.order('price', { ascending: true });
            break;
          default:
            break;
        }

        const { data, error } = await query;
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [contentType, searchQuery, subscribedContent, creatorId, sortBy]);

  return (
    <div className="space-y-6">
      <FilterControls
        sortBy={sortBy}
        contentType={contentType}
        onSortChange={setSortBy}
        onTypeChange={setContentType}
        onSearch={setSearchQuery}
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
