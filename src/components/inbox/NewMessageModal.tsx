import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { Search, Users, ImageIcon, X } from 'lucide-react';
import { Post } from '@/types/post';
import { Message } from '@/types/inbox';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isMassMessage, setIsMassMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachedContent, setAttachedContent] = useState<Post | null>(null);
  const [contentPrice, setContentPrice] = useState<number>(0);
  const [showContentSelector, setShowContentSelector] = useState(false);
  const [userContent, setUserContent] = useState<Post[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);
      
      setSearchResults(data || []);
    };

    searchUsers();
  }, [searchQuery]);

  useEffect(() => {
    if (!user || !showContentSelector) return;

    const fetchContent = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
      
      setUserContent(data || []);
    };

    fetchContent();
  }, [user, showContentSelector]);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `message-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!user || !message.trim()) return;
    setLoading(true);

    try {
      if (isMassMessage) {
        const { data: subscribers } = await supabase
          .from('subscriptions')
          .select('subscriber_id')
          .eq('creator_id', user.id)
          .eq('status', 'active');

        if (!subscribers?.length) {
          alert('You have no subscribers yet!');
          return;
        }

        const { data: massMessage } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            content: message,
            is_mass_message: true,
            attached_content_id: attachedContent?.id || null,
            content_price: contentPrice
          })
          .select()
          .single();

        await supabase.from('mass_message_recipients').insert(
          subscribers.map(sub => ({
            message_id: massMessage.id,
            recipient_id: sub.subscriber_id
          }))
        );
      } else {
        await Promise.all(
          selectedUsers.map(async (recipient) => {
            const { data: thread, error: threadError } = await supabase
              .from('message_threads')
              .insert({
                user1_id: user.id,
                user2_id: recipient.id,
                last_message_at: new Date().toISOString()
              })
              .select()
              .single();

            if (threadError && !threadError.message.includes('duplicate key')) {
              throw threadError;
            }

            const existingThread = threadError ? 
              await supabase
                .from('message_threads')
                .select()
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${recipient.id}),and(user1_id.eq.${recipient.id},user2_id.eq.${user.id})`)
                .single()
                .then(res => res.data)
              : thread;

            const imageUrl = file ? await uploadFile(file) : null;

            const { data, error } = await supabase
              .from('messages')
              .insert({
                thread_id: existingThread!.id,
                sender_id: user.id,
                recipient_id: recipient.id,
                content: message,
                is_mass_message: false,
                attached_content_id: attachedContent?.id || null,
                content_price: contentPrice,
                file: imageUrl,
                created_at: new Date().toISOString()
              })
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
              .single();

            if (error) {
              console.error('Message insert error:', error);
              throw error;
            }

            await supabase
              .from('message_threads')
              .update({ 
                last_message_at: new Date().toISOString(),
                last_message_id: data.id
              })
              .eq('id', existingThread!.id);
          })
        );
      }

      onClose();
      setMessage('');
      setSelectedUsers([]);
      setAttachedContent(null);
      setContentPrice(0);
      setFile(null);
    } catch (error) {
      console.error('Full error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMassMessage ? "Send Mass Message" : "New Message"}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setIsMassMessage(false)}
            className={`px-4 py-2 rounded-md ${!isMassMessage ? 'bg-black text-white' : 'bg-gray-100'}`}
          >
            Direct Message
          </button>
          <button
            onClick={() => setIsMassMessage(true)}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${isMassMessage ? 'bg-black text-white' : 'bg-gray-100'}`}
          >
            <Users className="w-4 h-4" />
            <span>Mass Message</span>
          </button>
        </div>

        {!isMassMessage && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedUsers.map(user => (
                <div key={user.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={() => setSelectedUsers(current => current.filter(u => u.id !== user.id))}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-md"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map(result => (
                  <button
                    key={result.id}
                    onClick={() => {
                      setSelectedUsers(current => [...current, result]);
                      setSearchQuery('');
                    }}
                    className="w-full p-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src={result.avatar_url || '/default_profile_picture.jpg'}
                        alt={result.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span>{result.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isMassMessage ? "Write a message to all your subscribers..." : "Write a message..."}
          className="w-full p-3 border rounded-md h-32"
        />

        <div className="flex items-center">
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
              }
            }}
            className="border rounded-md p-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowContentSelector(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Attach Content</span>
          </button>
          {attachedContent && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Content attached: {attachedContent.title}
              </span>
              <input
                type="number"
                value={contentPrice / 100}
                onChange={(e) => setContentPrice(Math.round(parseFloat(e.target.value) * 100))}
                placeholder="Price (USD)"
                className="w-24 p-1 border rounded"
                step="0.01"
                min="0"
              />
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={loading || !message.trim() || (!isMassMessage && selectedUsers.length === 0)}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      <Modal
        isOpen={showContentSelector}
        onClose={() => setShowContentSelector(false)}
        title="Select Content to Attach"
      >
        <div className="grid grid-cols-2 gap-4">
          {userContent.map(content => (
            <button
              key={content.id}
              onClick={() => {
                setAttachedContent(content);
                setShowContentSelector(false);
              }}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="relative aspect-video w-full mb-2">
                <Image
                  src={content.url}
                  alt={content.title || 'Content preview'}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <p className="font-medium truncate">{content.title}</p>
            </button>
          ))}
        </div>
      </Modal>
    </Modal>
  );
}