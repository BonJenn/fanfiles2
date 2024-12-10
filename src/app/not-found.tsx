'use client';

import Link from 'next/link';
import { SearchWrapper } from '@/components/common/SearchWrapper';

export default function NotFound() {
  return (
    <SearchWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <Link 
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
          >
            Go Home
          </Link>
        </div>
      </div>
    </SearchWrapper>
  );
}