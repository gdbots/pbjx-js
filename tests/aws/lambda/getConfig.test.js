import test from 'tape';
import aws from 'aws-sdk-mock';

test('getConfig tests', (t) => {
  aws.mock('SSM', 'getParameters', (arams, callback) => {
    callback(null, {
      InvalidParameters: [],
      Parameters: [
        {
          Type: 'String',
          Name: 'pbjxHost',
          Value: 'master-api.dev.tmzlabs.com',
        },
        {
          Type: 'String',
          Name: 'pbjxReceiveKey',
          Value: 'receive-key-value',
        },
      ],
    });
  });
  aws.restore();

  t.end();
});
