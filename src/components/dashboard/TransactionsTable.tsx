'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  post_id: string;
  buyer_id: string;
  post: {
    id: string;
    description: string;
  };
  buyer: {
    id: string;
    name: string;
  };
}

interface TransactionsTableProps {
  userId: string;
}

export function TransactionsTable({ userId }: TransactionsTableProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user || user.id !== userId) {
      setError('Unauthorized');
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id,
            created_at,
            amount,
            post_id,
            buyer_id,
            post:posts!post_id (
              id,
              description
            ),
            buyer:profiles!buyer_id (
              id,
              name
            )
          `)
          .eq('creator_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        setTransactions((data as unknown) as Transaction[]);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, userId]);

  if (error === 'Unauthorized') {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        You don't have permission to view these transactions
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 mb-2 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading transactions: {error}</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(transaction.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${(transaction.amount / 100).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {transaction.post.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {transaction.buyer.name}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}