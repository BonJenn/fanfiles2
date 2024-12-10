'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Feed } from '@/components/feed/Feed';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { SuggestedUsersSidebar } from '@/components/feed/SuggestedUsersSidebar';

export default function FeedPage() {
  return (
    <SearchWrapper>
      <div className="flex justify-center min-h-screen">
        <div className="flex space-x-8 max-w-screen-lg mx-auto">
          <div className="flex-1">
            <FeedContent />
          </div>
          <div className="mt-8">
            <SuggestedUsersSidebar />
          </div>
        </div>
      </div>
    </SearchWrapper>
  );
}

function FeedContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spinner />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="container px-4 py-8">
      <Feed subscribedContent={false} />
    </div>
  );
}