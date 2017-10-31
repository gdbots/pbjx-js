import test from 'tape';
import aws from 'aws-sdk-mock';
import realAws from 'aws-sdk';
import getConfig from '../../../src/aws/lambda/getConfig';

aws.setSDKInstance(realAws);

test('getConfig tests', async (t) => {
  t.skip('Implement once aws.mock works with ssm');
  aws.mock('SSM', 'getParameters', (params, callback) => {
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

  aws.restore();

  t.end();
});
