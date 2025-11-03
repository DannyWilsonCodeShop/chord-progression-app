# Backend Infrastructure Setup Guide

## 🎯 Overview

This guide explains how to deploy the complete backend infrastructure for MPC Studio, including:
- User authentication (AWS Cognito)
- Database (DynamoDB via Amplify Data)
- File storage (S3 via Amplify Storage)
- Subscription management (Stripe + Database)
- Recording save/retrieve functionality

---

## 📋 Prerequisites

1. **AWS Account** with Amplify access
2. **Stripe Account** with API keys
3. **Node.js** installed (v18+)
4. **Amplify CLI** installed globally: `npm install -g @aws-amplify/cli`

---

## 🚀 Step-by-Step Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Amplify

Initialize and deploy the Amplify backend:

```bash
# Start Amplify sandbox for development
npm run amplify:dev

# OR deploy to production
npm run amplify:deploy
```

This will create:
- ✅ AWS Cognito User Pool (authentication)
- ✅ DynamoDB tables (User and Recording models)
- ✅ S3 bucket (for recording storage)
- ✅ AppSync GraphQL API (data access)

### 3. Set Up Environment Variables

Create `.env.local` file in the project root:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Update Stripe Price ID

In `src/app/api/create-checkout-session/route.ts`, update line 34:

```typescript
price: 'price_YOUR_ACTUAL_PRICE_ID', // Replace with your Stripe price ID
```

### 6. Deploy the Application

```bash
# Build and deploy
npm run build
git push origin main
```

---

## 📊 Database Schema

### User Table

| Field | Type | Description |
|-------|------|-------------|
| id | string (PK) | Auto-generated UUID |
| email | string | User's email (from Cognito) |
| stripeCustomerId | string | Stripe customer ID |
| subscriptionStatus | enum | 'active' \| 'cancelled' \| 'past_due' \| 'none' |
| subscriptionId | string | Stripe subscription ID |
| subscriptionPriceId | string | Stripe price ID |
| subscriptionCurrentPeriodEnd | datetime | Subscription end date |
| owner | string | Cognito user ID (auto) |
| createdAt | datetime | Auto-generated |
| updatedAt | datetime | Auto-generated |

### Recording Table

| Field | Type | Description |
|-------|------|-------------|
| id | string (PK) | Auto-generated UUID |
| userId | string | Owner's Cognito ID |
| fileName | string | Original filename |
| s3Key | string | S3 object key |
| duration | integer | Recording duration (seconds) |
| fileSize | integer | File size (bytes) |
| progression | string | Chord progression used |
| key | string | Musical key signature |
| owner | string | Cognito user ID (auto) |
| createdAt | datetime | Auto-generated |
| updatedAt | datetime | Auto-generated |

---

## 🔄 Data Flow

### Subscription Flow

```
User → Click Subscribe
  ↓
Get user email from Cognito
  ↓
POST /api/create-checkout-session { email }
  ↓
Stripe creates checkout session
  ↓
User completes payment on Stripe
  ↓
Stripe sends webhook to /api/webhook
  ↓
Webhook updates User table with subscription status
  ↓
Frontend checks subscription via useSubscription() hook
  ↓
Features unlock based on subscription status
```

### Recording Flow

```
User → Record audio
  ↓
Stop recording (creates Blob)
  ↓
Upload to S3: recordings/{userId}/{timestamp}-{name}.webm
  ↓
Save metadata to Recording table
  ↓
User can:
  - Download locally
  - Access from cloud (if subscribed)
  - Play back
  - Delete
```

---

## 🔐 Security & Authorization

### Authentication
- Uses AWS Cognito for user management
- Email/password authentication
- JWT tokens for API authorization

### Data Access Rules
- **User model**: Owner can read/write their own data
- **Recording model**: Owner can read/write/delete their own recordings
- **Storage**: Users can only access their own `recordings/{userId}/` folder

### API Protection
- Amplify Data uses Cognito user pool for authorization
- Storage requires valid auth token
- Stripe webhooks verified with signing secret

---

## 🧪 Testing

### Test Subscription Flow
1. Sign up for a new account
2. Click "Subscribe Now"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify subscription status updates in database
5. Confirm features unlock in app

### Test Recording
1. Log in as subscribed user
2. Click "INIT" then "RECORD"
3. Play some chords
4. Click "STOP"
5. Verify recording appears in list
6. Check S3 bucket for uploaded file
7. Check DynamoDB for recording metadata

---

## 🐛 Troubleshooting

### Amplify outputs not generating
```bash
npx ampx generate outputs --app-id YOUR_APP_ID --branch main
```

### Webhook not receiving events
- Verify webhook URL is correct in Stripe dashboard
- Check webhook signing secret matches `.env.local`
- View logs in Stripe dashboard

### Subscription status not updating
- Check CloudWatch logs for webhook errors
- Verify database write permissions
- Check user email matches between Cognito and Stripe

### Recordings not saving
- Verify S3 bucket permissions
- Check auth token is valid
- View browser console for upload errors

---

## 📦 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Authentication**: AWS Cognito (via Amplify Auth)
- **Database**: DynamoDB (via Amplify Data)
- **Storage**: S3 (via Amplify Storage)
- **Payments**: Stripe
- **Hosting**: AWS Amplify Hosting
- **API**: Next.js API Routes + AppSync (auto-generated)

---

## 📞 Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Atlanta Creative Exchange
- Creator: Danny Wilson

---

Built with ❤️ in Atlanta

