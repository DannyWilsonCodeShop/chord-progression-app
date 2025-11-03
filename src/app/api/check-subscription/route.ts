import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/../../amplify/data/resource';

export async function GET(request: NextRequest) {
  try {
    const client = generateClient<Schema>();
    
    // Get the current user from the auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ isSubscribed: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user's subscription status from database
    const { data: users, errors } = await client.models.User.list({
      limit: 1,
    });

    if (errors || !users || users.length === 0) {
      return NextResponse.json({ isSubscribed: false });
    }

    const user = users[0];
    const isSubscribed = user.subscriptionStatus === 'active';
    
    return NextResponse.json({ 
      isSubscribed,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ isSubscribed: false, error: 'Failed to check subscription' }, { status: 500 });
  }
}

