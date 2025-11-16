'use client';

import { useState } from 'react';
import {
  testCards,
  testScenarios,
  webhookTestEvents,
  formatCardNumber,
} from '@/lib/stripe-test-utils';

export default function StripeTestPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'scenarios' | 'webhooks'>('cards');
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const copyToClipboard = (text: string, cardId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(cardId);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stripe Subscription Testing
          </h1>
          <p className="text-gray-600 mb-8">
            Use this page to test your Stripe integration with test cards and scenarios.
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'cards'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Test Cards
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'scenarios'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Test Scenarios
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'webhooks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Webhook Events
            </button>
          </div>

          {/* Test Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These are Stripe test cards. Use any future expiry date and any 3-digit CVC.
                </p>
              </div>

              {Object.entries(testCards).map(([key, card]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.description}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Card Number: {formatCardNumber(card.number)}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(card.number, key)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        copiedCard === key
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {copiedCard === key ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Expiry</p>
                      <p className="font-mono text-gray-900">{card.expiry}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">CVC</p>
                      <p className="font-mono text-gray-900">{card.cvc}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ZIP</p>
                      <p className="font-mono text-gray-900">Any 5 digits</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Test Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Instructions:</strong> Follow the steps for each scenario to test different payment outcomes.
                </p>
              </div>

              {testScenarios.map((scenario) => (
                <div key={scenario.id} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {scenario.name}
                  </h3>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Card:</strong> {formatCardNumber(scenario.card.number)}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Expected Outcome:</strong> {scenario.expectedOutcome}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {scenario.steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <a
                    href="/pricing"
                    className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
                  >
                    Go to Pricing Page
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Webhook Events Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> These events are sent by Stripe to your webhook endpoint. Monitor your server logs to see these events.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">To test webhooks locally:</p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                  stripe listen --forward-to localhost:3000/api/webhook
                </pre>
              </div>

              {webhookTestEvents.map((event, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.event}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {event.description}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Action:</strong> {event.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Reference */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Reference</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Environment Variables</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Useful Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://dashboard.stripe.com/test/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    → Stripe Test Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="https://dashboard.stripe.com/test/payments"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    → Test Payments
                  </a>
                </li>
                <li>
                  <a
                    href="https://dashboard.stripe.com/test/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    → Webhook Events
                  </a>
                </li>
                <li>
                  <a
                    href="https://stripe.com/docs/testing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    → Stripe Testing Docs
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
