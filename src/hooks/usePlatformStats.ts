import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      // Get total active creators
      const { count: creatorCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('is_creator', true);

      // Get total earnings (in cents, need to divide by 100 for dollars)
      const { data: earnings } = await supabase
        .from('transactions')
        .select('amount')
        .gt('amount', 0);

      const totalEarnings = earnings?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Get total monthly active users
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: monthlyUsers } = await supabase
        .from('user_activity')
        .select('user_id', { count: 'exact' })
        .gte('last_active', thirtyDaysAgo.toISOString());

      return {
        activeCreators: creatorCount || 0,
        totalEarnings: totalEarnings / 100, // Convert cents to dollars
        monthlyUsers: monthlyUsers || 0
      };
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
} 