import test from 'tape';
import aws from 'aws-sdk-mock';
import realAws from 'aws-sdk';
import getConfig from '../../../src/aws/lambda/getConfig';

aws.setSDKInstance(realAws);

test('getConfig tests', async (t) => {
  aws.mock('SSM', 'getParameters', (params, callback) => {
    t.comment('mock worked');

    callback(null, {
      InvalidParameters: [],
      Parameters: [
        {
          Type: 'String',
          Name: 'pbjxHost',
          Value: 'master-api.dev.com',
        },
        {
          Type: 'String',
          Name: 'pbjxReceiveKey',
          Value: 'receive-key-value',
        },
      ],
    });
  });

  try {
    const config = await getConfig({
      pbjxHost: '',
      pbjxReceiveKey: '',
    });

    t.same(config.pbjxHost, 'test1');
    t.same(config.pbjxReceiveKey, 'test2');
  } catch (e) {
    t.fail('getConfig failed');
  }

  aws.restore();

  t.end();
});
