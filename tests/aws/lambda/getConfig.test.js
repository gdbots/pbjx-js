import test from 'tape';
import aws from 'aws-sdk-mock';
import getConfig from '../../../src/aws/lambda/getConfig';

test('getConfig tests', (t) => {
  aws.mock('SSM', 'getParameters', function awsMockGet(params, callback) {
    callback(null, { Key: params.Key, Body: params.Body });
  });

  t.end();
});
