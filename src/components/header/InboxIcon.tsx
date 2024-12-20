import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const InboxIcon = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    console.log('Fetching unread count...');
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .is('read_at', null)
      .neq('sender_id', user.id);

    if (error) {
      console.error('Error fetching unread count:', error);
    } else {
      console.log('Unread count:', count);
      setUnreadCount(count || 0);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    // Subscribe to new messages only
    const channel = supabase
      .channel(`messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Message updated:', payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Listen for manual refresh events
    const handleMessagesRead = () => {
      console.log('Messages read event received');
      fetchUnreadCount();
    };

    window.addEventListener('messages-read', handleMessagesRead);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('messages-read', handleMessagesRead);
    };
  }, [user]);

  return (
    <button
      onClick={() => router.push('/inbox')}
      className="relative p-2 hover:bg-gray-100 rounded-full"
    >
      <MessageSquare className="w-6 h-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};