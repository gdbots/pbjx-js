import test from 'tape';
import TransportEnvelope from '../../src/transports/TransportEnvelope';

test('TransportEnvelope tests', (t) => {
  const s3Records = require('../aws/lambda/sample-events/s3.json');
  t.same(TransportEnvelope.toObject(JSON.stringify(s3Records)), s3Records);
  t.end();
});
