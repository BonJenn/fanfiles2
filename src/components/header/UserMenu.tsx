'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Spinner } from '@/components/common/Spinner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

export const UserMenu = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  if (loading) {
    return <Spinner className="w-8 h-8" />;
  }

  if (!user || !profile) {
    return (
      <div className="space-x-4">
        <Link href="/login" className="text-white hover:text-darkerBlue">
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-darkerBlue text-white px-4 py-2 rounded-md hover:bg-darkerBlue"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" onMouseLeave={() => setMenuOpen(false)}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center space-x-2 hover:opacity-80"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={profile.avatar_url || '/default_profile_picture.jpg'}
            alt={profile.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-gray-700">{profile.name}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1" style={{ marginTop: '-3px' }}>
          <Link
            href={`/creator/${user.id}`}
            className="block px-4 py-2 text-darkestBlue hover:bg-lighterBlue"
          >
            My Profile
          </Link>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-darkestBlue hover:bg-lighterBlue"
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-darkestBlue hover:bg-lighterBlue"
          >
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-darkestBlue hover:bg-lighterBlue"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

