import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'mpcStudioRecordings',
  access: (allow) => ({
    'recordings/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});

