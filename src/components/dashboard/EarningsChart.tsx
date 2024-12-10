'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EarningsChartProps {
  userId: string;
}

export function EarningsChart({ userId }: EarningsChartProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: 'Earnings Over Time',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)'
      }
    ]
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Earnings Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0
      }
    }
  };

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('created_at, amount')
          .eq('creator_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        if (error) throw error;

        // Create array of all dates in range
        const dates = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          return date;
        });

        // Initialize earnings for all dates
        let cumulativeEarnings = 0;
        const earningsData = dates.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const dayEarnings = transactions
            ?.filter(t => t.created_at.split('T')[0] === dateStr)
            .reduce((sum, t) => sum + (t.amount || 0) / 100, 0) || 0;
          cumulativeEarnings += dayEarnings;
          return cumulativeEarnings;
        });

        setChartData({
          labels: dates.map(date => date.toLocaleDateString()),
          datasets: [{
            label: 'Earnings Over Time',
            data: earningsData,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.1)'
          }]
        });
      } catch (err) {
        console.error('Error fetching earnings data:', err);
      }
    };

    fetchEarningsData();
  }, [userId, timeframe]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
          className="border rounded p-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      <Line options={options} data={chartData} />
    </div>
  );
}