'use client';

import { UserMenu } from './UserMenu';
import { SearchBar } from '@/components/common/SearchBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { MenuIcon, XIcon } from 'lucide-react';

export const Header = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="border-b sticky top-0 z-50 bg-white">
      <div className="max-w-screen-lg mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-darkestBlue">
          FanFiles
        </Link>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

        <div className={`fixed inset-0 bg-white z-40 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:static md:flex md:items-center md:justify-between`}>
          <button className="absolute top-4 right-4" onClick={() => setMenuOpen(false)}>
            <XIcon className="w-6 h-6" />
          </button>
          <div className="flex flex-col md:flex-row">
            {user && (
              <Link href={`/creator/${user.id}`} className="p-4 text-darkestBlue">
                My Profile
              </Link>
            )}
            <Link href="/dashboard" className="p-4 text-darkestBlue">Dashboard</Link>
            <Link href="/settings" className="p-4 text-darkestBlue">Settings</Link>
            <button onClick={handleSignOut} className="p-4 text-darkestBlue">Sign Out</button>
          </div>
        </div>

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
