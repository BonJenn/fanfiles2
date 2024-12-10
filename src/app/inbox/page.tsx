'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { InboxContent } from '@/components/inbox/InboxContent';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/common/Spinner';

export default function InboxPage() {
  return (
    <SearchWrapper>
      <InboxPageContent />
    </SearchWrapper>
  );
}

function InboxPageContent() {
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

  return <InboxContent />;
}