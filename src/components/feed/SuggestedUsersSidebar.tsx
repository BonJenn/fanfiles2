import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, UserPlus } from 'lucide-react';

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
    <div className="relative w-64">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-400 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative backdrop-blur-sm bg-white/90 border border-white/20 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Suggested Users
            </h2>
          </div>

          <ul className="space-y-4">
            {suggestedUsers.map(user => (
              <li
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={user.avatar_url || '/default_profile_picture.jpg'}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-300"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                    {user.name}
                  </h3>
                </div>

                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-full hover:bg-purple-100">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
      </div>
    </div>
  );
};