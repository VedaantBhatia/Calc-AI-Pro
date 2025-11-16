/**
 * Stripe Test Utilities
 * Helper functions for testing Stripe integration
 */

export const testCards = {
  success: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    description: 'Successful payment',
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/25',
    cvc: '123',
    description: 'Card declined',
  },
  authentication: {
    number: '4000002500003155',
    expiry: '12/25',
    cvc: '123',
    description: 'Requires 3D Secure authentication',
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/25',
    cvc: '123',
    description: 'Insufficient funds',
  },
  lostCard: {
    number: '4000000000009987',
    expiry: '12/25',
    cvc: '123',
    description: 'Lost card',
  },
  stolenCard: {
    number: '4000000000009979',
    expiry: '12/25',
    cvc: '123',
    description: 'Stolen card',
  },
};

/**
 * Format test card number for display
 */
export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Test scenarios for subscription testing
 */
export const testScenarios = [
  {
    id: 'successful-subscription',
    name: 'Successful Monthly Subscription',
    card: testCards.success,
    expectedOutcome: 'Subscription created, customer redirected to success page',
    steps: [
      'Navigate to /pricing',
      'Click "Upgrade to Pro"',
      'Enter test card details',
      'Complete checkout',
    ],
  },
  {
    id: 'declined-payment',
    name: 'Declined Payment',
    card: testCards.declined,
    expectedOutcome: 'Payment declined error, subscription not created',
    steps: [
      'Navigate to /pricing',
      'Click "Upgrade to Pro"',
      'Enter declined card details',
      'Observe error message',
    ],
  },
  {
    id: '3d-secure',
    name: '3D Secure Authentication',
    card: testCards.authentication,
    expectedOutcome: 'Redirected to authentication, then to success page after completing challenge',
    steps: [
      'Navigate to /pricing',
      'Click "Upgrade to Pro"',
      'Enter 3D Secure card details',
      'Complete authentication challenge',
      'Verify subscription created',
    ],
  },
  {
    id: 'insufficient-funds',
    name: 'Insufficient Funds',
    card: testCards.insufficientFunds,
    expectedOutcome: 'Payment declined due to insufficient funds',
    steps: [
      'Navigate to /pricing',
      'Click "Upgrade to Pro"',
      'Enter insufficient funds card',
      'Observe error message',
    ],
  },
];

/**
 * Webhook test events
 */
export const webhookTestEvents = [
  {
    event: 'checkout.session.completed',
    description: 'Fired when checkout session is completed successfully',
    action: 'Create subscription in database',
  },
  {
    event: 'customer.subscription.created',
    description: 'Fired when a new subscription is created',
    action: 'Update user subscription status',
  },
  {
    event: 'customer.subscription.updated',
    description: 'Fired when subscription is updated (plan change, etc)',
    action: 'Sync subscription changes',
  },
  {
    event: 'customer.subscription.deleted',
    description: 'Fired when subscription is canceled',
    action: 'Revoke premium access',
  },
  {
    event: 'charge.succeeded',
    description: 'Fired when charge succeeds',
    action: 'Log successful charge',
  },
  {
    event: 'charge.failed',
    description: 'Fired when charge fails',
    action: 'Log failed charge, notify user',
  },
  {
    event: 'invoice.payment_succeeded',
    description: 'Fired when invoice payment succeeds',
    action: 'Update invoice status',
  },
  {
    event: 'invoice.payment_failed',
    description: 'Fired when invoice payment fails',
    action: 'Notify user of failed payment',
  },
];

/**
 * Validation helpers
 */
export const validators = {
  /**
   * Check if card number is valid (basic Luhn algorithm)
   */
  isValidCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  /**
   * Check if expiry date is valid
   */
  isValidExpiry(expiry: string): boolean {
    const [month, year] = expiry.split('/');
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (m < 1 || m > 12) return false;

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (y < currentYear) return false;
    if (y === currentYear && m < currentMonth) return false;

    return true;
  },

  /**
   * Check if CVC is valid
   */
  isValidCVC(cvc: string): boolean {
    return /^\d{3,4}$/.test(cvc);
  },
};

/**
 * Logging helper for debugging
 */
export const logger = {
  logCheckoutStart: (priceId: string) => {
    console.log(`[Stripe Test] Starting checkout for price: ${priceId}`);
  },

  logCheckoutSuccess: (sessionId: string) => {
    console.log(`[Stripe Test] Checkout session created: ${sessionId}`);
  },

  logCheckoutError: (error: unknown) => {
    console.error(`[Stripe Test] Checkout error:`, error);
  },

  logWebhookReceived: (event: string) => {
    console.log(`[Stripe Test] Webhook received: ${event}`);
  },

  logWebhookError: (event: string, error: unknown) => {
    console.error(`[Stripe Test] Webhook error for ${event}:`, error);
  },
};
