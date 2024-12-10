import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAnalytics(userId: string, timeframe: '7d' | '30d' | '90d') {
  return useQuery({
    queryKey: ['analytics', userId, timeframe],
    queryFn: async () => {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('creator_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Create array of all dates in range
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
      });

      // Initialize earnings for all dates
      const dailyEarnings = dates.reduce((acc, date) => {
        acc[date] = 0;
        return acc;
      }, {} as Record<string, number>);

      // Add transaction amounts to corresponding dates
      transactions?.forEach(({ created_at, amount }) => {
        const date = new Date(created_at).toISOString().split('T')[0];
        if (dailyEarnings.hasOwnProperty(date)) {
          dailyEarnings[date] += (amount || 0) / 100;
        }
      });

      return {
        dates: Object.keys(dailyEarnings),
        revenue: Object.values(dailyEarnings)
      };
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}