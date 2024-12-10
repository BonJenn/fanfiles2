import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  avatar_url: string;
}

export const SuggestedUsersSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .neq('id', user.id)
        .limit(5);

      if (!error) {
        setSuggestedUsers(data || []);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleUserClick = (userId: string) => {
    router.push(`/creator/${userId}`);
  };

  return (
    <div className="w-64 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Suggested Users</h2>
      <ul>
        {suggestedUsers.map(user => (
          <li
            key={user.id}
            className="flex items-center mb-4 cursor-pointer"
            onClick={() => handleUserClick(user.id)}
          >
            <Image
              src={user.avatar_url || '/default_profile_picture.jpg'}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="ml-3">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};