'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThreadList } from './ThreadList';
import { MessageView } from './MessageView';
import { NewMessageModal } from './NewMessageModal';
import { Plus } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function InboxContent() {
  const { user } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showThreadList, setShowThreadList] = useState(!isMobile);

  useEffect(() => {
    setShowThreadList(!isMobile || !selectedThreadId);
  }, [isMobile, selectedThreadId]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg border min-h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Thread List */}
          {showThreadList && (
            <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r'}`}>
              <div className="p-4 border-b">
                <button
                  onClick={() => setShowNewMessage(true)}
                  className="w-full bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Message</span>
                </button>
              </div>
              <ThreadList
                selectedThreadId={selectedThreadId}
                onSelectThread={(threadId) => {
                  setSelectedThreadId(threadId);
                  if (isMobile) setShowThreadList(false);
                }}
              />
            </div>
          )}

          {/* Message View */}
          {(!isMobile || !showThreadList) && (
            <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col`}>
              <MessageView
                threadId={selectedThreadId}
                onBack={() => {
                  if (isMobile) {
                    setShowThreadList(true);
                    setSelectedThreadId(null);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
      />
    </div>
  );
}