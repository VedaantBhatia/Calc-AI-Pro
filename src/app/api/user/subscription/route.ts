import { NextResponse } from 'next/server';
import { checkSubscription } from '@/lib/subscription';

export async function GET() {
  try {
    const { hasActiveSubscription, subscription } = await checkSubscription();
    
    return NextResponse.json({
      hasActiveSubscription,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
