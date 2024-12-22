'use client';

import NotificationSettings from '@/components/settings/NotificationSettings';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/common/Spinner';

export default function NotificationSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SettingsLayout>
      <NotificationSettings />
    </SettingsLayout>
  );
} 