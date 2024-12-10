'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentManagement } from '@/components/dashboard/ContentManagement';
import { EarningsChart } from '@/components/dashboard/EarningsChart';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { Spinner } from '@/components/common/Spinner';

export function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your content and track your earnings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">$1,234</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">24</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Subscribers</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">156</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Earnings Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Earnings Overview</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200">
                    7d
                  </button>
                  <button className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200">
                    30d
                  </button>
                  <button className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200">
                    90d
                  </button>
                </div>
              </div>
              <div className="h-[300px]">
                <EarningsChart userId={user.id} />
              </div>
            </div>

            {/* Content Management */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <ContentManagement userId={user.id} />
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <TransactionsTable userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

