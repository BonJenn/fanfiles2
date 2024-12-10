'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/common/Spinner';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = 'Search creators...' }: SearchBarProps) => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && !query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <Suspense fallback={<Spinner />}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      </form>
    </Suspense>
  );
};