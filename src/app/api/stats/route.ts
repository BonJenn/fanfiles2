import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [creatorCount, supporterCount, earnings] = await Promise.all([
      prisma.profiles.count({
        where: { subscription_price: { gt: 0 } }
      }),
      prisma.profiles.count({
        where: { subscription_price: { equals: null } }
      }),
      prisma.transactions.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'completed'
        }
      })
    ]);

    return NextResponse.json({
      creatorCount,
      supporterCount,
      totalEarnings: earnings._sum.amount || 0
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
} 