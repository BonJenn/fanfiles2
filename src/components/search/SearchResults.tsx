import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { Spinner } from '@/components/common/Spinner';

interface SearchResultsProps {
  initialQuery: string;
}

interface Creator {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

export function SearchResults({ initialQuery }: SearchResultsProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialQuery) return;
    searchCreators(initialQuery);
  }, [initialQuery]);

  const searchCreators = async (query: string) => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, bio')
        .or(`name.ilike.%${query}%, bio.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCreators(data || []);
    } catch (err: any) {
      console.error('Error searching creators:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!initialQuery) {
    return (
      <div className="text-gray-500 text-center">
        Enter a search term to find creators
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-gray-500 text-center">
        No creators found for "{initialQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {creators.map((creator) => (
        <Link 
          key={creator.id}
          href={`/creator/${creator.id}`}
          className="block bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <Image
                src={creator.avatar_url || '/default_profile_picture.jpg'}
                alt={creator.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{creator.name}</h3>
              {creator.bio && (
                <p className="text-sm text-gray-500 line-clamp-2">{creator.bio}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}