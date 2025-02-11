'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';
import { SearchWrapper } from '@/components/common/SearchWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/header/Header';
import { useQuery } from '@tanstack/react-query';
import { getStats } from '@/lib/api';

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

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: getStats,
    initialData: {
      creatorCount: 0,
      supporterCount: 0,
      totalEarnings: 0,
    }
  });

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
    <div className="min-h-screen bg-white">
      {/* Hero Section with animated gradient background */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 
                      animate-gradient-shift bg-[length:400%_400%]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold animate-fade-in-up delay-100 
                             bg-gradient-to-r from-purple-900 via-purple-700 to-pink-700 
                             bg-clip-text text-transparent">
                  Create More.
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold animate-fade-in-up delay-200 
                             bg-gradient-to-r from-purple-900 via-purple-700 to-pink-700 
                             bg-clip-text text-transparent">
                  Share More.
                </h1>
                <h1 className="text-5xl md:text-6xl font-bold animate-fade-in-up delay-300 
                             bg-gradient-to-r from-purple-900 via-purple-700 to-pink-700 
                             bg-clip-text text-transparent">
                  Earn More.
                </h1>
              </div>
              <p className="text-lg md:text-xl text-purple-800 max-w-2xl animate-fade-in-up delay-400">
                A platform where creators can share exclusive content with their biggest supporters.
                Join our community of passionate creators and build your audience today.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-8 animate-fade-in-up delay-500">
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-900">
                    {stats.creatorCount.toLocaleString()}+
                  </div>
                  <div className="text-sm text-purple-700">Creators</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-900">
                    {stats.supporterCount.toLocaleString()}+
                  </div>
                  <div className="text-sm text-purple-700">Supporters</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-900">
                    ${(stats.totalEarnings / 1000000).toFixed(1)}M+
                  </div>
                  <div className="text-sm text-purple-700">Earned</div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl space-y-6 
                            animate-fade-in-up delay-200">
                <h2 className="text-3xl font-bold text-center text-purple-900">Get Started</h2>
                <Link
                  href="/signup"
                  className="block bg-purple-900 text-white py-4 rounded-xl text-lg font-semibold 
                            text-center transition-transform hover:scale-105 hover:bg-purple-800"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="block bg-white text-purple-900 py-4 rounded-xl text-lg font-semibold 
                            text-center border-2 border-purple-900 transition-transform 
                            hover:scale-105 hover:bg-purple-50"
                >
                  Login
                </Link>
                <p className="text-sm text-purple-700 text-center pt-4">
                  Join thousands of creators already on our platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Featured Content Section */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Content</h2>
          <p className="text-gray-600">Discover what creators are sharing on our platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example Featured Post 1 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <span className="text-white p-4 font-medium">Photography</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Capturing Urban Life</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <span className="text-sm text-gray-600">by Sarah Parker</span>
              </div>
            </div>
          </div>

          {/* Example Featured Post 2 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <span className="text-white p-4 font-medium">Music</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Behind the Scenes</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <span className="text-sm text-gray-600">by Mike Johnson</span>
              </div>
            </div>
          </div>

          {/* Example Featured Post 3 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <span className="text-white p-4 font-medium">Art</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Digital Art Collection</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <span className="text-sm text-gray-600">by Alex Chen</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/explore"
            className="inline-block bg-black text-white px-8 py-3 rounded-xl 
                      text-lg font-semibold transition-transform hover:scale-105 
                      hover:bg-gray-900"
          >
            Explore More Content
          </Link>
        </div>
      </div>
    </div>
  );
}

