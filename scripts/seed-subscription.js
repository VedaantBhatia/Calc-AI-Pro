const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create user and subscription for testing
  const user = await prisma.user.upsert({
    where: { email: 'bhatiav0909@gmail.com' },
    create: {
      email: 'bhatiav0909@gmail.com',
      name: 'Vedaant',
    },
    update: {},
  });

  console.log('User created:', user);

  const subscription = await prisma.subscription.upsert({
    where: { stripeSubscriptionId: 'sub_test_123' },
    create: {
      userId: user.id,
      stripeCustomerId: 'cus_test_123',
      stripeSubscriptionId: 'sub_test_123',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Subscription created:', subscription);
}

main().catch(console.error).finally(() => prisma.$disconnect());
