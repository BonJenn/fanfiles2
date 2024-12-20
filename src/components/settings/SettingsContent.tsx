'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/common/Spinner';
import Image from 'next/image';

export function SettingsContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState<number | null>(profile?.subscription_price || null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          subscription_price: subscriptionPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (updateError) throw updateError;
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="relative w-32 h-32">
            <Image
              src={profile?.avatar_url || '/default_profile_picture.jpg'}
              alt={profile?.name || 'Profile'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 text-green-500 p-4 rounded-md">{success}</div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500">
                  {user.email}
                </div>
              </div>

              <div>
                <label htmlFor="subscriptionPrice" className="block text-sm font-medium text-gray-700">
                  Monthly Subscription Price (USD)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="subscriptionPrice"
                    min="0"
                    step="0.01"
                    value={subscriptionPrice ? (subscriptionPrice / 100).toFixed(2) : ''}
                    onChange={(e) => setSubscriptionPrice(e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                    className="focus:ring-black focus:border-black block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">/month</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for free subscriptions
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}