'use client';

import { Settings, User, CreditCard, Lock, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const settingsNavItems = [
    { label: 'Profile', href: '/settings', icon: User },
    { label: 'Payment', href: '/settings/payment', icon: CreditCard },
    { label: 'Security', href: '/settings/security', icon: Lock },
    { label: 'Notifications', href: '/settings/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="backdrop-blur-sm bg-white/80 rounded-2xl p-4 sticky top-24">
              <nav className="space-y-1">
                {settingsNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-black/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 backdrop-blur-sm bg-white/80 rounded-2xl p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}