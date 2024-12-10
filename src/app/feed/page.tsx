'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Feed } from '@/components/feed/Feed';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { SearchWrapper } from '@/components/common/SearchWrapper';

export default function FeedPage() {
  return (
    <SearchWrapper>
      <FeedContent />
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
    <div className="container mx-auto px-4 py-8">
      <Feed subscribedContent={false} />
    </div>
  );
}