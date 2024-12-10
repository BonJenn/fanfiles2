'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Feed } from '@/components/feed/Feed';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

interface CreatorProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  subscriber_count: number;
  post_count: number;
  subscription_price: number | null;
}

const SubscribeButton = ({ profile, onSubscribe }: { profile: CreatorProfile; onSubscribe: () => void }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      if (profile.subscription_price) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) throw new Error('Failed to load Stripe');

        const response = await fetch('/api/stripe/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId: profile.id,
            priceAmount: profile.subscription_price,
            returnUrl: window.location.href,
          }),
        });

        const { url, error } = await response.json();
        if (error) throw new Error(error);
        
        window.location.href = url;
      } else {
        // Handle free subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            subscriber_id: user.id,
            creator_id: profile.id,
            status: 'active',
          });

        if (error) throw error;
        onSubscribe();
      }
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const buttonText = profile.subscription_price 
    ? `Subscribe for $${(profile.subscription_price / 100).toFixed(2)}/month`
    : 'Subscribe for Free';

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
};

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
            post_count,
            subscription_price
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
          <SubscribeButton profile={profile} onSubscribe={() => {}} />
        </div>
      </div>

      {/* Creator's Content */}
      <Feed creatorId={creatorId} subscribedContent={false} showCreatePost={false} />
    </div>
  );
}