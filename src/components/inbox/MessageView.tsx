'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ChevronLeft, Send, Image as ImageIcon, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_mass_message: boolean;
  attached_content_id: string | null;
  content_price: number;
  sender: {
    name: string;
    avatar_url: string;
  };
}

interface User {
  id: string;
  name: string;
  avatar_url: string;
}

interface MessageViewProps {
  threadId: string | null;
  onBack: () => void;
}

export function MessageView({ threadId, onBack }: MessageViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!threadId || !user) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          is_mass_message,
          attached_content_id,
          content_price,
          sender:profiles!sender_id (
            name,
            avatar_url
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (!error && messages) {
        setMessages(messages.map(message => ({
          ...message,
          sender: message.sender[0]
        })) as Message[]);
        scrollToBottom();
      }
      setLoading(false);
    };

    fetchMessages();

    // Mark messages as red
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('recipient_id', user.id)
      .is('read_at', null);

    // Subscribe to new messages
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      }, (payload) => {
        setMessages(current => [...current, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, user]);

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
    if (!newMessage.trim() || !threadId || !user || !otherUser) return;

    try {
      console.log('Sending message with:', {
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: otherUser.id,
        content: newMessage.trim()
      });

      const { error } = await supabase.from('messages').insert({
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: otherUser.id,
        content: newMessage.trim(),
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b flex items-center space-x-4">
        <button onClick={onBack} className="md:hidden">
          <ChevronLeft className="w-6 h-6" />
        </button>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[70%] ${message.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={message.sender.avatar_url || '/default_profile_picture.jpg'}
                  alt={message.sender.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div
                className={`mx-2 p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-black text-white rounded-tr-none'
                    : 'bg-gray-100 rounded-tl-none'
                }`}
              >
                {message.content}
                {message.attached_content_id && (
                  <div className="mt-2 p-2 bg-gray-800 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Attached Content</span>
                      {message.content_price > 0 && (
                        <span className="flex items-center text-xs">
                          <DollarSign className="w-3 h-3" />
                          {(message.content_price / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}