import { defineData } from '@aws-amplify/backend';
import { type ClientSchema, a } from '@aws-amplify/backend';

const schema = a.schema({
  ChordProgression: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      key: a.string().required(), // e.g., "C major", "A minor"
      progression: a.string().required(), // e.g., "C-Am-F-G"
      tempo: a.integer(),
      userId: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
  
  UserSettings: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      keyboardMapping: a.string(), // JSON string of key-to-chord mappings
      defaultTempo: a.integer(),
      audioSettings: a.string(), // JSON string of audio preferences
    })
    .authorization((allow) => [
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
