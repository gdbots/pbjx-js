import UserCreatedV1 from '@gdbots/acme-schemas/acme/iam/event/UserCreatedV1';
import test from 'tape';
import TransportEnvelope from '../../src/transports/TransportEnvelope';

test('TransportEnvelope tests', (t) => {
  const userCreated = new UserCreatedV1();
  const transportEnvelope = new TransportEnvelope(userCreated, 'json');

  t.same(transportEnvelope.toString(), 'test');
  t.end();
});
