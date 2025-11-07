import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'cancelled' | 'past_due' | 'none'>('none');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      
      // Get current authenticated user
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId;

      console.log('🔍 Subscription check - User email:', userEmail);

      if (!userEmail) {
        console.log('❌ No user email found');
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      // Query user subscription status from database (get ALL matching users)
      const { data: users, errors } = await client.models.User.list({
        filter: { email: { eq: userEmail } },
        limit: 100, // Get all users with this email (in case of duplicates)
      });

      console.log('🔍 Subscription query result:', {
        foundUsers: users?.length || 0,
        errors: errors || 'none',
        queryEmail: userEmail,
        allUsers: users,
      });

      if (errors || !users || users.length === 0) {
        // User not found in database - don't create, just mark as not subscribed
        console.log('ℹ️ No user record found in database (not subscribed yet)');
        setIsSubscribed(false);
        setSubscriptionStatus('none');
      } else {
        // If multiple users exist (duplicates), find the one with 'active' status
        const activeUser = users.find(u => u.subscriptionStatus === 'active');
        const userData = activeUser || users[0];
        
        if (users.length > 1) {
          console.log('⚠️ WARNING: Multiple users found with same email!', users.length);
        }
        
        const isActive = userData.subscriptionStatus === 'active';
        console.log('📊 Subscription check:', {
          email: userEmail,
          status: userData.subscriptionStatus,
          isActive,
          subscriptionId: userData.subscriptionId,
          userId: userData.id,
          totalDuplicates: users.length,
        });
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

