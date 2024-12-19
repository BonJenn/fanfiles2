'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  thread_id: string;
  sender?: {
    name: string;
    avatar_url: string | null;
  };
}

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

export function MessageView({ threadId, onBack }: { threadId: string; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch messages
  useEffect(() => {
    if (!threadId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id (
            id,
            name,
            avatar_url
          ),
          attached_content:posts!attached_content_id (
            id,
            title,
            url,
            type
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    console.log('Setting up message subscription for thread:', threadId);

    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          console.log('Received new message:', payload.new);
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  // Fetch other user's profile
  useEffect(() => {
    if (!threadId || !user) return;

    const fetchOtherUser = async () => {
      const { data: thread } = await supabase
        .from('message_threads')
        .select('user1_id, user2_id')
        .eq('id', threadId)
        .single();

      if (thread) {
        const otherUserId = thread.user1_id === user.id ? thread.user2_id : thread.user1_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (profile) {
          setOtherUser(profile);
        }
      }
    };

    fetchOtherUser();
  }, [threadId, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !threadId || !user || !otherUser) {
      console.log('Missing required data:', { 
        message: newMessage, 
        threadId, 
        userId: user?.id, 
        otherUserId: otherUser?.id 
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          recipient_id: otherUser.id,
          content: newMessage.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Message insert error:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center space-x-4">
        {otherUser && (
          <>
            <div className="relative w-10 h-10">
              <Image
                src={otherUser.avatar_url || '/default_profile_picture.jpg'}
                alt={otherUser.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <span className="font-medium">{otherUser.name}</span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === user?.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            onClick={handleSend}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}