/* eslint-disable max-len */
import test from 'tape';
import UserV1 from '@gdbots/acme-schemas/acme/iam/node/UserV1';
import TransportEnvelope from '../../src/transports/TransportEnvelope';

test('TransportEnvelope tests', (t) => {
  const user = UserV1.fromObject({ _id: '9c632008-124f-454a-aeef-fd424612abc3', created_at: '1508977465084000' });
  const envelope = new TransportEnvelope(user, 'json');

  t.same(envelope.toObject(),
    {
      serializer: 'json',
      is_replay: false,
      message: '{"_schema":"pbj:acme:iam:node:user:1-0-0","_id":"9c632008-124f-454a-aeef-fd424612abc3","status":"draft","created_at":"1508977465084000","is_blocked":false,"is_staff":false}',
    },
  );

  t.same(envelope.toJSON(),
    {
      serializer: 'json',
      is_replay: false,
      message: '{"_schema":"pbj:acme:iam:node:user:1-0-0","_id":"9c632008-124f-454a-aeef-fd424612abc3","status":"draft","created_at":"1508977465084000","is_blocked":false,"is_staff":false}',
    },
  );

  t.same(envelope.toString(),
    '{"serializer":"json","is_replay":false,"message":"{\\"_schema\\":\\"pbj:acme:iam:node:user:1-0-0\\",\\"_id\\":\\"9c632008-124f-454a-aeef-fd424612abc3\\",\\"status\\":\\"draft\\",\\"created_at\\":\\"1508977465084000\\",\\"is_blocked\\":false,\\"is_staff\\":false}"}',
  );

  t.same(JSON.stringify(TransportEnvelope.fromJSON(JSON.stringify(envelope))), JSON.stringify(envelope));

  t.same(envelope.isReplay(), false);

  t.end();
});


test('TransportEnvelope isReplay tests', (t) => {
  const replayedEnvelope = TransportEnvelope.fromJSON('{"serializer":"json","is_replay":true,"message":"{\\"_schema\\":\\"pbj:acme:iam:node:user:1-0-0\\",\\"_id\\":\\"9c632008-124f-454a-aeef-fd424612abc3\\",\\"status\\":\\"draft\\",\\"created_at\\":\\"1508977465084000\\",\\"is_blocked\\":false,\\"is_staff\\":false}"}');
  t.same(replayedEnvelope.isReplay(), true);

  const newEnvelope = TransportEnvelope.fromJSON('{"serializer":"json","is_replay":false,"message":"{\\"_schema\\":\\"pbj:acme:iam:node:user:1-0-0\\",\\"_id\\":\\"9c632008-124f-454a-aeef-fd424612abc3\\",\\"status\\":\\"draft\\",\\"created_at\\":\\"1508977465084000\\",\\"is_blocked\\":false,\\"is_staff\\":false}"}');
  t.same(newEnvelope.isReplay(), false);
  t.same(newEnvelope.getSerializerUsed(), 'json');

  t.end();
});
