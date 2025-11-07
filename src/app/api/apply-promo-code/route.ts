import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

// Valid promo codes (you can add more or move to environment variables)
const VALID_PROMO_CODES: Record<string, { description: string; duration: string }> = {
  'STUDENT2024': {
    description: 'Student Free Access',
    duration: 'forever', // or set an expiry date
  },
  'EDUCATION': {
    description: 'Education Free Access',
    duration: 'forever',
  },
  'TEACHER': {
    description: 'Teacher Free Access',
    duration: 'forever',
  },
};

export async function POST(request: NextRequest) {
  try {
    const { promoCode } = await request.json();

    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    // Validate promo code
    const codeUpper = promoCode.trim().toUpperCase();
    const validCode = VALID_PROMO_CODES[codeUpper];

    if (!validCode) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    // Get current user
    const user = await getCurrentUser();
    const userEmail = user.signInDetails?.loginId;

    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check if user exists in database
    const { data: users } = await client.models.User.list({
      filter: { email: { eq: userEmail } },
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
        email: userEmail,
        subscriptionStatus: 'active',
        subscriptionId: `promo_${codeUpper}`,
        subscriptionPriceId: 'promo_code_free',
        subscriptionCurrentPeriodEnd: currentPeriodEnd.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${validCode.description} applied successfully!`,
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { error: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
}

