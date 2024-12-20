'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from './PostCard';
import { FilterControls } from './FilterControls';
import { Post } from '@/types/post';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { Sparkles, TrendingUp, UserCircle } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'following' | 'forYou'>('forYou');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 -z-10"></div>
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] -z-10"></div>

      <div className="max-w-[800px] mx-auto px-6 py-8">
        {renderCreatePost()}

        <div className="mb-8 backdrop-blur-sm bg-white/80 rounded-2xl p-6 border border-white/20 shadow-lg w-full">
          <FilterControls
            sortBy={sortBy}
            contentType={contentType}
            onSortChange={setSortBy}
            onTypeChange={setContentType}
            onSearch={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div 
                key={n} 
                className="h-[600px] rounded-2xl bg-gradient-to-br from-white/40 to-white/60 backdrop-blur-sm animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="backdrop-blur-sm bg-red-50/80 text-red-600 p-6 rounded-2xl border border-red-100">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first one to share something amazing!</p>
          </div>
        )}
      </div>
    </div>
  );
};
