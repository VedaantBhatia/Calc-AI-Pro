'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { getStripePriceId } from '@/lib/stripe';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    features: [
      'Basic calculations',
      'Basic functions',
      'Limited API access',
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline',
  },
  {
    name: 'Pro',
    price: '$6.99',
    priceId: getStripePriceId(),
    features: [
      'Advanced calculations',
      'All functions',
      'Full API access',
      'Priority support',
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default',
    highlight: true,
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubscribe = async (priceId?: string) => {
    if (!priceId) return;

    if (!session?.user?.email) {
      alert('Please sign in to subscribe');
      return;
    }

    setIsLoading(true);
    try {
      const userEmail = session.user.email;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId,
          userEmail, // Include user email in the request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to the Checkout page
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Select the plan that works best for you.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-lg shadow-sm divide-y ${
                plan.highlight
                  ? 'border-indigo-600 bg-white shadow-md'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="p-6">
                <h2 className="text-lg font-medium leading-6 text-gray-900">
                  {plan.name}
                </h2>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== 'Free' && (
                    <span className="text-base font-medium text-gray-500">
                      /month
                    </span>
                  )}
                </p>
                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading || !plan.priceId}
                  className={`mt-8 block w-full rounded-md py-3 text-center text-sm font-semibold ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {isLoading ? 'Processing...' : plan.buttonText}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What&apos;s included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-3 text-base text-gray-500">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
