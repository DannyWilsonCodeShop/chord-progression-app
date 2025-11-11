import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Check if we're in dev mode
const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.NODE_ENV === 'development';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(isDev); // Default to true in dev mode
  const [loading, setLoading] = useState(!isDev); // No loading in dev mode
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'cancelled' | 'past_due' | 'none'>(
    isDev ? 'active' : 'none'
  );
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  useEffect(() => {
    if (!isDev) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    // Skip subscription check in dev mode
    if (isDev) {
      setIsSubscribed(true);
      setSubscriptionStatus('active');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get current authenticated user
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId;

      if (!userEmail) {
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      // Query user subscription status from database (get ALL matching users)
      const { data: users, errors } = await client.models.User.list({
        filter: { email: { eq: userEmail } },
        limit: 100, // Get all users with this email (in case of duplicates)
      });

      if (errors || !users || users.length === 0) {
        // User not found in database - don't create, just mark as not subscribed
        setIsSubscribed(false);
        setSubscriptionStatus('none');
      } else {
        // If multiple users exist (duplicates), find the one with 'active' status
        const activeUser = users.find(u => u.subscriptionStatus === 'active');
        const userData = activeUser || users[0];
        
        const isActive = userData.subscriptionStatus === 'active';
        setIsSubscribed(isActive);
        setSubscriptionStatus(userData.subscriptionStatus || 'none');
        setCurrentPeriodEnd(userData.subscriptionCurrentPeriodEnd || null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isSubscribed,
    loading,
    subscriptionStatus,
    currentPeriodEnd,
    refetch: checkSubscription,
  };
}

