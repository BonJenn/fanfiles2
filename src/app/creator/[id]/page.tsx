'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Feed } from '@/components/feed/Feed';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Modal } from '@/components/ui/Modal';

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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const checkSubscription = useCallback(async () => {
    if (!user) return;
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, stripe_subscription_id')
      .eq('creator_id', profile.id)
      .eq('subscriber_id', user.id)
      .single();
    
    // Only consider active subscriptions
    setIsSubscribed(subscription?.status === 'active');
  }, [user, profile.id]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const handleUnsubscribe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id, stripe_subscription_id')
        .eq('creator_id', profile.id)
        .eq('subscriber_id', user.id)
        .single();

      if (subscription?.stripe_subscription_id) {
        const response = await fetch('/api/stripe/cancel-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: subscription.stripe_subscription_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to cancel Stripe subscription');
        }
      }

      // Always update the status in our database
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription?.id);

      if (error) throw error;

      setIsSubscribed(false);
      setShowConfirmation(false);
      onSubscribe();
    } catch (err) {
      console.error('Unsubscribe error:', err);
      alert('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Check for any existing subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('creator_id', profile.id)
        .eq('subscriber_id', user.id)
        .single();

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', existingSubscription.id);

        if (error) throw error;
        setIsSubscribed(true);
        onSubscribe();
        return;
      }

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
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            subscriber_id: user.id,
            creator_id: profile.id,
            status: 'active',
          });

        if (error) throw error;
        setIsSubscribed(true);
        onSubscribe();
      }
    } catch (err) {
      console.error('Subscription error:', err);
      alert(err instanceof Error ? err.message : 'Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === profile.id) return null;

  return (
    <>
      {isSubscribed ? (
        <button
          onClick={() => setShowConfirmation(true)}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
          disabled={loading}
        >
          Unsubscribe
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
          disabled={loading}
        >
          {profile.subscription_price 
            ? `Subscribe for $${(profile.subscription_price / 100).toFixed(2)}/month`
            : 'Subscribe for Free'}
        </button>
      )}

      {showConfirmation && (
        <Modal 
          isOpen={showConfirmation}
          title="Confirm Unsubscribe"
          onClose={() => setShowConfirmation(false)}
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to unsubscribe from {profile.name}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUnsubscribe}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
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
    <div className="max-w-screen-lg mx-auto px-4 py-8">
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