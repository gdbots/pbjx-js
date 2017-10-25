import test from 'tape';
import aws from 'aws-sdk-mock';
import getConfig from '../../../src/aws/lambda/getConfig';

const params = {
  pbjxHost: '/tmz-pbjx/dev/receive-endpoint',
  pbjxReceiveKey: '/tmz-pbjx/dev/receive-key',
};

test('getConfig tests', (t) => {
  aws.mock('SSM', 'getParameters', (ssmparams, callback) => {
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

  const config = getConfig(params, 5);
  t.same(JSON.stringify(config),
    JSON.stringify(
      {
        loaded: true,
        expires_at: 'FIX',
        ttl: 5,
        pbjxHost: 'master-api.dev.tmzlabs.com',
        pbjxReceiveKey: 'receive-key-value',
      },
    ),
  );
  aws.restore();

  t.end();
});
