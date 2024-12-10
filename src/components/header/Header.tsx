'use client';

import { UserMenu } from './UserMenu';
import { SearchBar } from '@/components/common/SearchBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-blue border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-darkestBlue">
          FanFiles
        </Link>

        {/* Conditionally render Search Bar */}
        {user && (
          <div className="max-w-md w-full mx-4">
            <Suspense fallback={<Spinner />}>
              <SearchBar onSearch={handleSearch} />
            </Suspense>
          </div>
        )}

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
