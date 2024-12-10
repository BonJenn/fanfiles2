'use client';

import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { FilterControls } from './FilterControls';
import { Post } from '@/types/post';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { CreatePostForm } from '@/components/posts/CreatePostForm';

export type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low';
export type ContentType = 'all' | 'image' | 'video';

interface FeedProps {
  subscribedContent: boolean;
  creatorId?: string;
  showCreatePost?: boolean;
}

export const Feed = ({ subscribedContent, creatorId, showCreatePost = true }: FeedProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

      // Apply search filter to both post description and creator name
      if (searchQuery) {
        query = query.or(`
          description.ilike.%${searchQuery}%,
          creator.name.ilike.%${searchQuery}%
        `);
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

  useEffect(() => {
    fetchPosts();
  }, [contentType, searchQuery, subscribedContent, creatorId, sortBy]);

  // Add create post button at the top of the feed
  const renderCreatePost = () => {
    if (!showCreatePost || !user) return null;
    
    return (
      <div className="mb-8 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {isCreateModalOpen ? (
          <div className="p-8">
            <CreatePostForm
              onSuccess={async () => {
                await fetchPosts();
                setIsCreateModalOpen(false);
              }}
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">Share Your Content</h3>
            <p className="text-gray-600 mb-6">Upload images or videos to share with your audience</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-black to-gray-800 text-white px-8 py-3 rounded-full hover:from-gray-800 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Create New Post
            </button>
          </div>
        )}
      </div>
    );
  };

  const searchUsers = async (query: string) => {
    if (!query) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {renderCreatePost()}
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
