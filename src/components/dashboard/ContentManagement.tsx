'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/post';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { Modal } from '@/components/ui/Modal';

interface ContentManagementProps {
  userId: string;
}

export function ContentManagement({ userId }: ContentManagementProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleDelete = async (postId: string) => {
    if (!user || user.id !== userId) {
      setError('Unauthorized');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err: any) {
      console.error('Error deleting post:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (error === 'Unauthorized') {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        You don't have permission to manage this content
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading content: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Content</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-md text-sm"
        >
          Create New Post
        </button>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-gray-500">{post.description}</p>
              <p className="text-sm text-gray-500">
                ${(post.price / 100).toFixed(2)} • {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Post"
      >
        <CreatePostForm onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchPosts();
        }} />
      </Modal>
    </div>
  );
}