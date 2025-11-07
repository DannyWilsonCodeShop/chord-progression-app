'use client';

import { useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Valid promo codes
const VALID_PROMO_CODES: Record<string, { description: string }> = {
  'STUDENT2024': { description: 'Student Free Access' },
  'EDUCATION': { description: 'Education Free Access' },
  'TEACHER': { description: 'Teacher Free Access' },
};

interface SubscriptionManagerProps {
  isSubscribed: boolean;
  onSubscriptionUpdate: () => void;
}

export default function SubscriptionManager({ isSubscribed, onSubscriptionUpdate }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState<string>('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      // Get email from authenticated user
      const user = await getCurrentUser();
      const email = user.signInDetails?.loginId;
      
      if (!email) {
        setError('Could not get user email. Please sign in again.');
        setLoading(false);
        return;
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const { url, error: apiError } = await response.json();

      if (apiError) {
        setError(apiError);
        return;
      }

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

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setError('');
    setPromoSuccess('');

    try {
      // Validate promo code
      const codeUpper = promoCode.trim().toUpperCase();
      const validCode = VALID_PROMO_CODES[codeUpper];

      if (!validCode) {
        setError('Invalid promo code');
        setPromoLoading(false);
        return;
      }

      // Get email from authenticated user
      const user = await getCurrentUser();
      const email = user.signInDetails?.loginId;
      
      if (!email) {
        setError('Could not get user email. Please sign in again.');
        setPromoLoading(false);
        return;
      }

      // Check if user exists in database
      const { data: users } = await client.models.User.list({
        filter: { email: { eq: email } },
        limit: 1,
      });

      const currentPeriodEnd = new Date();
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 100); // Effectively forever

      if (users && users.length > 0) {
        // Update existing user
        await client.models.User.update({
          id: users[0].id,
          subscriptionStatus: 'active',
          subscriptionId: `promo_${codeUpper}`,
          subscriptionPriceId: 'promo_code_free',
          subscriptionCurrentPeriodEnd: currentPeriodEnd.toISOString(),
        });
      } else {
        // Create new user with promo code
        await client.models.User.create({
          email: email,
          subscriptionStatus: 'active',
          subscriptionId: `promo_${codeUpper}`,
          subscriptionPriceId: 'promo_code_free',
          subscriptionCurrentPeriodEnd: currentPeriodEnd.toISOString(),
        });
      }

      setPromoSuccess(`${validCode.description} applied successfully! 🎉`);
      setPromoCode('');
      
      // Refresh subscription status
      setTimeout(() => {
        onSubscriptionUpdate();
        window.location.reload(); // Reload to update UI
      }, 1500);
    } catch (err) {
      setError('Failed to apply promo code. Please try again.');
      console.error('Promo code error:', err);
    } finally {
      setPromoLoading(false);
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
              $9.99
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
              {loading ? 'PROCESSING...' : 'SUBSCRIBE NOW - $9.99/MONTH'}
            </button>

            <div className="text-center text-xs text-gray-500">
              Cancel anytime. Secure payment powered by Stripe.
            </div>

            {/* Promo Code Section */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="text-center text-sm text-gray-400 mb-3 font-mono">
                📚 HAVE A STUDENT OR PROMO CODE?
              </div>
              
              {promoSuccess && (
                <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded mb-3 text-sm">
                  ✅ {promoSuccess}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                  placeholder="STUDENT2024"
                  disabled={promoLoading}
                  className="flex-1 bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-green-400 disabled:bg-gray-700 font-mono text-sm"
                />
                <button
                  onClick={handleApplyPromoCode}
                  disabled={promoLoading || !promoCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition-colors font-mono text-sm whitespace-nowrap"
                >
                  {promoLoading ? '⏳' : 'APPLY'}
                </button>
              </div>
              
              <div className="text-center text-xs text-gray-500 mt-2">
                Students & educators get free access with a valid code.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
