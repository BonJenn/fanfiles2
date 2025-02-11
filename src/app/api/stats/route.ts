import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [creatorCount, supporterCount, earnings] = await Promise.all([
      prisma.user.count({
        where: { role: 'CREATOR' }
      }),
      prisma.user.count({
        where: { role: 'SUPPORTER' }
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true
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