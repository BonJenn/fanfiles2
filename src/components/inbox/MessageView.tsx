import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  thread_id: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  file?: string | null;
}

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface MessageViewProps {
  threadId: string;
  onBack: () => void;
}

export function MessageView({ threadId, onBack }: MessageViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

    // Set up realtime channel
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
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

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

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `messages/${fileName}`;

      console.log('Attempting to upload file:', {
        fileName,
        filePath,
        fileType: file.type,
        fileSize: file.size
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        return null;
      }

      console.log('Upload successful:', uploadData);

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Full upload error:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !threadId || !user || !otherUser) {
      return;
    }

    try {
      let imageUrl = null;
      if (file) {
        console.log('Starting file upload...');
        imageUrl = await uploadFile(file);
        console.log('File upload result:', imageUrl);
        if (!imageUrl) {
          throw new Error('Failed to upload file');
        }
      }

      // Updated messageData to match schema exactly
      const messageData = {
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: otherUser.id,
        content: newMessage.trim(),
        is_mass_message: false,
        attached_content_id: null,
        content_price: 0
      };

      // Only add file if it exists
      if (imageUrl) {
        messageData['file'] = imageUrl;
      }

      console.log('Message data being sent:', JSON.stringify(messageData, null, 2));

      const { data: insertedData, error: insertError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error full details:', insertError);
        throw insertError;
      }

      console.log('Message sent successfully:', insertedData);

      setMessages(prev => [...prev, insertedData]);
      setNewMessage('');
      setFile(null);

      // Update thread's last message timestamp
      await supabase
        .from('message_threads')
        .update({ 
          last_message_at: new Date().toISOString(),
          last_message_id: insertedData.id 
        })
        .eq('id', threadId);

    } catch (error: any) {
      console.error('Full error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
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
                sizes="(max-width: 768px) 40px, 40px"
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
              {message.file && (
                <div className="mt-2">
                  <div 
                    className="relative w-48 h-48 cursor-pointer"
                    onClick={() => setSelectedImage(message.file!)}
                  >
                    <Image
                      src={message.file}
                      alt="Attachment"
                      fill
                      sizes="(max-width: 768px) 192px, 192px"
                      className="object-cover rounded"
                    />
                  </div>
                </div>
              )}
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
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
              }
            }}
            className="border rounded-md p-2"
          />
          <button
            onClick={handleSend}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Send
          </button>
        </div>
      </div>

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Image Preview"
      >
        <div className="relative w-full" style={{ height: '80vh' }}>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Full size attachment"
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-contain"
              priority
            />
          )}
        </div>
      </Modal>
    </div>
  );
}