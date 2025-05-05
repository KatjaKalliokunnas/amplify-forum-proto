import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Forum: a
    .model({
      headpost: a.string(),
      response: a.string().array(), // vastaus tallennetaan taulukkoon
    })
    .authorization((allow) => [allow.publicApiKey()]), // pääsy apikey:llä
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
