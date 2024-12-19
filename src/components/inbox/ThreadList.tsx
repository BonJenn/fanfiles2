'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Thread } from '@/types/inbox';

interface ThreadListProps {
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export function ThreadList({ selectedThreadId, onSelectThread }: ThreadListProps) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchThreads = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_threads', { user_id: user.id });

        if (error) {
          console.error('Error fetching threads:', error);
          return;
        }

        setThreads(data || []);
      } catch (err) {
        console.error('Failed to fetch threads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();

    // Set up realtime subscription
    const channel = supabase
      .channel('thread_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="divide-y">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 ${
            selectedThreadId === thread.id ? 'bg-gray-50' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src={thread.other_user_avatar || '/default_profile_picture.jpg'}
                alt={thread.other_user_name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{thread.other_user_name}</p>
              <p className="text-sm text-gray-500 truncate">
                {thread.last_message || 'No messages yet'}
              </p>
            </div>
            {thread.last_message_at && (
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}