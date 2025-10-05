'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface SubscriptionManagerProps {
  isSubscribed: boolean;
  onSubscriptionUpdate: (subscribed: boolean) => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionManager({ isSubscribed, onSubscriptionUpdate }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SEyAqRtvxb94uiE7Xa4LmJp',
        }),
      });

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      }
    } catch (err) {
      setError('Failed to start subscription process. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError('');

    try {
      // Create customer portal session
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Customer Portal
        window.location.href = url;
      }
    } catch (err) {
      setError('Failed to open subscription management. Please try again.');
      console.error('Portal error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-700">
      <h3 className="text-xl font-semibold mb-6 text-green-400 font-mono tracking-wider">
        SUBSCRIPTION
      </h3>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isSubscribed ? (
        <div>
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">
            ✅ You&apos;re subscribed to MPC Studio Pro!
          </div>
          
          <div className="space-y-4">
            <div className="text-gray-300">
              <div className="font-mono text-sm mb-2">PRO FEATURES UNLOCKED:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>🎵 High-quality audio recording</li>
                <li>💾 Save and download your recordings</li>
                <li>☁️ Cloud storage for your tracks</li>
                <li>🎛️ Advanced effects and filters</li>
                <li>📱 Access from any device</li>
              </ul>
            </div>

            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors font-mono"
            >
              {loading ? 'LOADING...' : 'MANAGE SUBSCRIPTION'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-green-400 font-mono mb-2">
              MPC STUDIO PRO
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              $3.99
            </div>
            <div className="text-gray-400 text-sm">
              per month
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-gray-300">
              <div className="font-mono text-sm mb-2">PRO FEATURES:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>🎵 Record your chord progressions</li>
                <li>💾 Save and download recordings</li>
                <li>☁️ Cloud storage for your tracks</li>
                <li>🎛️ Advanced audio effects</li>
                <li>📱 Access from any device</li>
                <li>🔄 Sync across all devices</li>
              </ul>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-black font-bold py-3 px-4 rounded-lg transition-colors font-mono"
            >
              {loading ? 'PROCESSING...' : 'SUBSCRIBE NOW - $3.99/MONTH'}
            </button>

            <div className="text-center text-xs text-gray-500">
              Cancel anytime. Secure payment powered by Stripe.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
