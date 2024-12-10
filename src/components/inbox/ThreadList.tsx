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
      const { data, error } = await supabase
        .rpc('get_user_threads', { user_id: user.id })
        .order('last_message_at', { ascending: false });

      if (!error && data) {
        setThreads(data);
      }
      setLoading(false);
    };

    fetchThreads();

    // Subscribe to new messages
    const channel = supabase
      .channel('threads')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, () => {
        fetchThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <div className="p-4">Loading threads...</div>;
  }

  return (
    <div className="overflow-y-auto h-[calc(100%-4rem)]">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 border-b ${
            selectedThreadId === thread.id ? 'bg-gray-50' : ''
          }`}
        >
          <div className="relative w-12 h-12">
            <Image
              src={thread.other_user.avatar_url || '/default_profile_picture.jpg'}
              alt={thread.other_user.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <p className="font-medium truncate">{thread.other_user.name}</p>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(thread.last_message.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {thread.last_message.is_mass_message && '📢 '}
              {thread.last_message.content}
            </p>
          </div>
          {thread.unread_count > 0 && (
            <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {thread.unread_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}