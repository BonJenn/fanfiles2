'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/common/Spinner';
import { CreditCard, DollarSign, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
}

export function PaymentSettings() {
  const { user } = useAuth();
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(0);
  const [isCreator, setIsCreator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Fetch initial data
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_price, is_creator')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setSubscriptionPrice(data.subscription_price || 0);
        setIsCreator(data.is_creator || false);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    async function fetchPaymentData() {
      if (!user) return;
      
      try {
        // TODO: Implement Stripe payment methods fetch
        // This is a placeholder for demo purposes
        setPaymentMethods([
          {
            id: '1',
            last4: '4242',
            brand: 'visa',
            expMonth: 12,
            expYear: 2024
          }
        ]);

        // TODO: Implement earnings fetch
        // This is a placeholder
        setEarnings(1234.56);

      } catch (error) {
        console.error('Error fetching payment data:', error);
      }
    }

    fetchPaymentData();
  }, [user]);

  const handleSavePrice = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_price: subscriptionPrice,
          is_creator: subscriptionPrice > 0, // Automatically set creator status when price is set
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsCreator(subscriptionPrice > 0);
    } catch (error) {
      console.error('Error updating subscription price:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center"><Spinner /></div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>

      <div className="space-y-8">
        {/* Creator Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-medium mb-4">Creator Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm ${
              isCreator 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isCreator ? 'Creator' : 'Subscriber'}
            </div>
            {!isCreator && (
              <p className="text-sm text-gray-600">
                Set a subscription price to become a creator
              </p>
            )}
          </div>
        </div>

        {/* Earnings Overview (show only for creators) */}
        {isCreator && (
          <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl p-6">
            <h2 className="text-lg font-medium mb-4">Total Earnings</h2>
            <div className="text-3xl font-bold">${earnings.toFixed(2)}</div>
          </div>
        )}

        {/* Subscription Price */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-medium mb-4">Subscription Price</h2>
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Monthly subscription price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={subscriptionPrice}
                  onChange={(e) => setSubscriptionPrice(Number(e.target.value))}
                  className="pl-7 pr-4 py-2 border rounded-lg w-32"
                />
              </div>
            </div>
            <button
              onClick={handleSavePrice}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Price'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This is the amount subscribers will pay monthly to access your content
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
              >
                <div className="flex items-center gap-4">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {method.brand.toUpperCase()} •••• {method.last4}
                    </div>
                    <div className="text-sm text-gray-500">
                      Expires {method.expMonth}/{method.expYear}
                    </div>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Remove
                </button>
              </div>
            ))}
            
            <button className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Payout Information */}
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium">Payout Information</h2>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            Connect your bank account to receive payments from your subscribers.
          </p>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Set Up Payouts
          </button>
        </div>
      </div>
    </div>
  );
}