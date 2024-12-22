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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(0);
  const [earnings, setEarnings] = useState<number>(0);

  useEffect(() => {
    async function fetchPaymentData() {
      if (!user) return;
      
      try {
        // Fetch profile data for subscription price
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_price')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        setSubscriptionPrice(profile.subscription_price || 0);

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
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentData();
  }, [user]);

  const handlePriceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    setSubscriptionPrice(newPrice);
  };

  const handleSavePrice = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_price: subscriptionPrice })
        .eq('id', user.id);

      if (error) throw error;
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
        {/* Earnings Overview */}
        <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Total Earnings</h2>
          <div className="text-3xl font-bold">${earnings.toFixed(2)}</div>
        </div>

        {/* Subscription Price */}
        <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium mb-4">Subscription Price</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">
                Monthly Subscription Price (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={subscriptionPrice}
                  onChange={handlePriceChange}
                  className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-black focus:ring-black"
                />
              </div>
            </div>
            <button
              onClick={handleSavePrice}
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Price'}
            </button>
          </div>
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