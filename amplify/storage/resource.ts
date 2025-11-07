import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'mpcStudioRecordings',
  access: (allow) => ({
    'public/recordings/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read']),
    ],
  }),
});

