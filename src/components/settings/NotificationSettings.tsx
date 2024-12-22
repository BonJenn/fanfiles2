'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Bell, MessageSquare, Heart, DollarSign, Users, Mail } from 'lucide-react';

interface NotificationPreferences {
  email_new_message: boolean;
  email_new_subscriber: boolean;
  email_new_like: boolean;
  email_new_purchase: boolean;
  push_new_message: boolean;
  push_new_subscriber: boolean;
  push_new_like: boolean;
  push_new_purchase: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_new_message: true,
    email_new_subscriber: true,
    email_new_like: true,
    email_new_purchase: true,
    push_new_message: true,
    push_new_subscriber: true,
    push_new_like: false,
    push_new_purchase: true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchPreferences() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setPreferences(data);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      }
    }

    fetchPreferences();
  }, [user]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          ...newPreferences,
        });

      if (error) throw error;
      setSuccess('Preferences updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const notificationGroups = [
    {
      title: 'Messages',
      icon: MessageSquare,
      emailKey: 'email_new_message' as keyof NotificationPreferences,
      pushKey: 'push_new_message' as keyof NotificationPreferences,
    },
    {
      title: 'New Subscribers',
      icon: Users,
      emailKey: 'email_new_subscriber' as keyof NotificationPreferences,
      pushKey: 'push_new_subscriber' as keyof NotificationPreferences,
    },
    {
      title: 'Likes & Interactions',
      icon: Heart,
      emailKey: 'email_new_like' as keyof NotificationPreferences,
      pushKey: 'push_new_like' as keyof NotificationPreferences,
    },
    {
      title: 'Purchases & Payments',
      icon: DollarSign,
      emailKey: 'email_new_purchase' as keyof NotificationPreferences,
      pushKey: 'push_new_purchase' as keyof NotificationPreferences,
    },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Email Preferences */}
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            {notificationGroups.map(({ title, icon: Icon, emailKey }) => (
              <div key={emailKey} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span>{title}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences[emailKey]}
                    onChange={() => handleToggle(emailKey)}
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium">Push Notifications</h2>
          </div>

          <div className="space-y-4">
            {notificationGroups.map(({ title, icon: Icon, pushKey }) => (
              <div key={pushKey} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span>{title}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences[pushKey]}
                    onChange={() => handleToggle(pushKey)}
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}