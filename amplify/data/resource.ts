import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // User model - stores user profile and subscription info
  User: a
    .model({
      email: a.string().required(),
      stripeCustomerId: a.string(),
      subscriptionStatus: a.enum(['active', 'cancelled', 'past_due', 'none']),
      subscriptionId: a.string(),
      subscriptionPriceId: a.string(),
      subscriptionCurrentPeriodEnd: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // Recording model - stores user's recorded chord progressions
  Recording: a
    .model({
      userId: a.string().required(),
      fileName: a.string().required(),
      s3Key: a.string().required(),
      duration: a.integer(),
      fileSize: a.integer(),
      progression: a.string(),
      key: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.ownerDefinedIn('userId'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

