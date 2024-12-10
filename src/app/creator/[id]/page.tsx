'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Feed } from '@/components/feed/Feed';
import { Spinner } from '@/components/common/Spinner';

interface CreatorProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  subscriber_count: number;
  post_count: number;
}

export default function CreatorProfile() {
  const params = useParams();
  const creatorId = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            bio,
            avatar_url,
            subscriber_count,
            post_count
          `)
          .eq('id', creatorId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [creatorId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error || 'Creator not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="relative w-32 h-32">
            <Image
              src={profile.avatar_url || '/default_profile_picture.jpg'}
              alt={profile.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            {profile.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{profile.subscriber_count} subscribers</span>
              <span>{profile.post_count} posts</span>
            </div>
          </div>
          <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
            Subscribe
          </button>
        </div>
      </div>

      {/* Creator's Content */}
      <Feed creatorId={creatorId} subscribedContent={false} />
    </div>
  );
}