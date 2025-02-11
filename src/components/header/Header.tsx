'use client';

import { UserMenu } from './UserMenu';
import { SearchBar } from '@/components/common/SearchBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { MenuIcon, XIcon, Settings } from 'lucide-react';
import Image from 'next/image';

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
        <Link href="/" className="text-xl font-bold text-darkestBlue flex items-center gap-2">
          <Image 
            src="/fanfiles_logo.png"
            alt="FanFiles Icon"
            width={40}
            height={40}
          />
          FanFiles
        </Link>

        {/* Search Bar */}
        {user && (
          <div className="flex-1 mx-4">
            <Suspense fallback={<Spinner />}>
              <SearchBar onSearch={handleSearch} />
            </Suspense>
          </div>
        )}

        {/* Hamburger Menu and User Menu */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XIcon className="w-6 h-6 text-blue-500" /> : <MenuIcon className="w-6 h-6 text-blue-500" />}
          </button>
          <UserMenu />
        </div>

        <div className={`fixed inset-0 bg-white z-40 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
          <button className="absolute top-4 right-4" onClick={() => setMenuOpen(false)}>
            <XIcon className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            {user && (
              <Link href={`/creator/${user.id}`} className="p-4 text-darkestBlue" onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
            )}
            <Link href="/dashboard" className="p-4 text-darkestBlue" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="p-4 text-darkestBlue">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
