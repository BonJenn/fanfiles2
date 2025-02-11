import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { X } from 'lucide-react';

interface SearchUsersProps {
  onSelect: (user: any) => void;
  selectedUsers: any[];
  onRemove: (userId: string) => void;
}

export function SearchUsers({ onSelect, selectedUsers, onRemove }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (error) {
        console.error('Error searching users:', error);
      } else {
        setSearchResults(data || []);
      }
      setIsSearching(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="space-y-2">
      {/* Selected Users */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-1"
          >
            {user.avatar_url && (
              <div className="relative w-5 h-5">
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <span className="text-sm">{user.name}</span>
            <button
              onClick={() => onRemove(user.id)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-black"
      />

      {/* Search Results */}
      {searchQuery && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {isSearching ? (
            <div className="p-2 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  onSelect(result);
                  setSearchQuery('');
                }}
                className="w-full p-2 hover:bg-gray-50 flex items-center gap-2 text-left"
                disabled={selectedUsers.some(u => u.id === result.id)}
              >
                {result.avatar_url && (
                  <div className="relative w-8 h-8">
                    <Image
                      src={result.avatar_url}
                      alt={result.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <span>{result.name}</span>
              </button>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
} 