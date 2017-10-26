import UserV1 from '@gdbots/acme-schemas/acme/iam/node/UserV1';
import test from 'tape';
import TransportEnvelope from '../../src/transports/TransportEnvelope';

test('TransportEnvelope tests', (t) => {
  const createUser = UserV1.fromObject({ _id: '9c632008-124f-454a-aeef-fd424612abc3', created_at: '1508977465084000' });
  const transportEnvelope = new TransportEnvelope(createUser, 'json');

  t.same(transportEnvelope.toObject(),
    {
      serializer: 'json',
      is_replay: false,
      message: '{"_schema":"pbj:acme:iam:node:user:1-0-0","_id":"9c632008-124f-454a-aeef-fd424612abc3","status":"draft","created_at":"1508977465084000","is_blocked":false,"is_staff":false}',
    },
  );

  t.same(transportEnvelope.toJSON(),
    {
      serializer: 'json',
      is_replay: false,
      message: '{"_schema":"pbj:acme:iam:node:user:1-0-0","_id":"9c632008-124f-454a-aeef-fd424612abc3","status":"draft","created_at":"1508977465084000","is_blocked":false,"is_staff":false}',
    },
  );

  t.same(transportEnvelope.toString(),
    '{"serializer":"json","is_replay":false,"message":"{\\"_schema\\":\\"pbj:acme:iam:node:user:1-0-0\\",\\"_id\\":\\"9c632008-124f-454a-aeef-fd424612abc3\\",\\"status\\":\\"draft\\",\\"created_at\\":\\"1508977465084000\\",\\"is_blocked\\":false,\\"is_staff\\":false}"}',
  );

  t.same(transportEnvelope.isReplay(), false);

  t.end();
});
