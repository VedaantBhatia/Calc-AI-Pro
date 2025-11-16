import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface SubscriptionData {
  id: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Date;
}

export async function checkSubscription(): Promise<{
  hasActiveSubscription: boolean;
  subscription: SubscriptionData | null;
}> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return {
      hasActiveSubscription: false,
      subscription: null,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    const hasActiveSubscription = user?.subscription?.status === 'active';
    
    return {
      hasActiveSubscription,
      subscription: user?.subscription || null,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasActiveSubscription: false,
      subscription: null,
    };
  }
}
