'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/header/Header';

export default function Home() {
  return (
    <SearchWrapper>
      <HomeContent />
    </SearchWrapper>
  );
}

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 bg-black text-white flex flex-col justify-center items-start p-8 md:p-16 md:pl-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Create More.</h1>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Share More.</h1>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Earn More.</h1>
        <p className="text-base md:text-lg text-gray-400 mt-2">A platform where creators can share exclusive content with their biggest supporters.</p>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Get Started</h2>
        <Link
          href="/signup"
          className="inline-block bg-black text-white w-full md:w-48 text-center py-3 rounded-md mb-3 text-lg"
        >
          Create Account
        </Link>
        <Link
          href="/login"
          className="inline-block bg-white text-black w-full md:w-48 text-center py-3 rounded-md border border-black text-lg"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

