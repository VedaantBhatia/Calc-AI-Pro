'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

type Status = 'loading' | 'success' | 'processing' | 'error';

function SuccessContent() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your subscription...');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found. Please try again or contact support.');
      return;
    }

    const verifySubscription = async () => {
      try {
        // Verify the checkout session with our API
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to verify session');
        }

        const session = await response.json();

        if (session.status === 'complete' && session.payment_status === 'paid') {
          // If payment is complete and successful
          setStatus('success');
          setMessage('Your subscription is now active!');
        } else if (session.status === 'processing') {
          // If payment is still processing
          setStatus('processing');
          setMessage('Your payment is being processed. This may take a few minutes...');
          // Check again after a delay
          setTimeout(verifySubscription, 3000);
        } else {
          // If payment failed or was cancelled
          setStatus('error');
          setMessage('There was an issue with your payment. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your subscription. Please try again or contact support.');
      }
    };

    verifySubscription();
  }, [sessionId]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'processing':
      case 'loading':
      default:
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Subscription Active!';
      case 'error':
        return 'Something went wrong';
      case 'processing':
        return 'Processing...';
      default:
        return 'Verifying...';
    }
  };

  return (
    <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center">
      <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
        {getStatusIcon()}
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        {getTitle()}
      </h2>

      <p className="text-gray-300 mb-8">
        {message}
      </p>

      <Button
        onClick={() => router.push('/')}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={status !== 'success'}
      >
        {status === 'success' ? (
          <>
            Go to Calculator
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          'Please wait...'
        )}
      </Button>

      {status === 'error' && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => router.push('/pricing')}
        >
          Back to Pricing
        </Button>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center">
      <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
      <p className="text-gray-300 mb-8">Please wait...</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
