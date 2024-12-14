'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [activeTab, setActiveTab] = useState<'following' | 'forYou'>('following');
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('posts')
        .select(`
          *,
          creator:profiles!creator_id (
            id,
            name,
            avatar_url
          )
        `);

      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      } else if (subscribedContent) {
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('creator_id')
          .eq('subscriber_id', user.id)
          .eq('status', 'active');

        const creatorIds = subscriptions?.map(sub => sub.creator_id) || [];
        query = query.in('creator_id', creatorIds);
      } else {
        if (activeTab === 'following') {
          const { data: following } = await supabase
            .from('subscriptions')
            .select('creator_id')
            .eq('subscriber_id', user.id)
            .eq('status', 'active');

          const followingIds = following?.map(f => f.creator_id) || [];
          query = query.in('creator_id', followingIds);
        } else if (activeTab === 'forYou') {
          query = query.eq('is_public', true);
        }
      }

      query = query.order('created_at', { ascending: sortBy === 'oldest' });

      const { data, error } = await query;

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, sortBy, creatorId, subscribedContent]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, contentType, searchQuery, subscribedContent, creatorId, sortBy, activeTab]);

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
          <div className="p-8 text-center mt-4">
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

      {!creatorId && (
        <div className="flex justify-center space-x-4">
          <button
            className={`px-4 py-2 ${activeTab === 'following' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'forYou' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('forYou')}
          >
            For You
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="max-w-screen-lg mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          Error loading posts: {error}
        </div>
      )}
    </div>
  );
};
