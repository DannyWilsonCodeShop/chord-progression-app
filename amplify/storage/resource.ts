import { defineStorage } from '@aws-amplify/backend';

/**
 * Define and configure your storage resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/storage/
 */
export const storage = defineStorage({
  name: 'chordProgressionStorage',
  access: (allow) => ({
    'chord-progressions/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'audio-samples/*': [
      allow.authenticated.to(['read']),
      allow.guest.to(['read']), // Allow guests to access audio samples
    ],
  }),
});
