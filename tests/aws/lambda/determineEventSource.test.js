import test from 'tape';
import determineShard from '../../../src/aws/lambda/determineEventSource';
import dynamodbEvent from './sample-events/dynamodb.json';

test('determineEventSource tests', (t) => {

  // assert that it's the expected type
  // dynamodbEvent resolves to dynamodb for example
  // but also, dynamodb does NOT resolve as any other service
  // this is as important

  t.end();
});
