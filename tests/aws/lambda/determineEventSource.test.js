import test from 'tape';
import determineEventSource, { AWS_EVENT } from '../../../src/aws/lambda/determineEventSource';
import mockEventCloudfront from '../../aws/lambda/sample-events/cloudfront.json';
import mockEventApiGateway from '../../aws/lambda/sample-events/apigateway-proxy.json';
import mockEventCognitoSync from '../../aws/lambda/sample-events/cognito-sync.json';
import mockEventDynamoDB from '../../aws/lambda/sample-events/dynamodb.json';
import mockEventKinesis from '../../aws/lambda/sample-events/kinesis.json';
import mockEventKinesisFirehose from '../../aws/lambda/sample-events/kinesis-firehose.json';
import mockEventS3 from '../../aws/lambda/sample-events/s3.json';
import mockEventScheduled from '../../aws/lambda/sample-events/scheduled-event.json';
import mockEventSes from '../../aws/lambda/sample-events/ses.json';
import mockEventSns from '../../aws/lambda/sample-events/sns.json';


function eventTypeMatches(event, expectedEvent) {
  const eventType = determineEventSource(event);

  return eventType === expectedEvent;
}

test('Event Type Detection Tests', async (t) => {
  t.ok(eventTypeMatches(mockEventCloudfront, AWS_EVENT.CLOUDFRONT));
  t.ok(eventTypeMatches(mockEventApiGateway, AWS_EVENT.APIGATEWAY_PROXY));
  t.ok(eventTypeMatches(mockEventCognitoSync, AWS_EVENT.COGNITO_SYNC));
  t.ok(eventTypeMatches(mockEventDynamoDB, AWS_EVENT.DYNAMODB));
  t.ok(eventTypeMatches(mockEventKinesis, AWS_EVENT.KINESIS));
  t.ok(eventTypeMatches(mockEventKinesisFirehose, AWS_EVENT.KINESIS_FIREHOSE));
  t.ok(eventTypeMatches(mockEventS3, AWS_EVENT.S3));
  t.ok(eventTypeMatches(mockEventScheduled, AWS_EVENT.SCHEDULED));
  t.ok(eventTypeMatches(mockEventSes, AWS_EVENT.SES));
  t.ok(eventTypeMatches(mockEventSns, AWS_EVENT.SNS));
  t.end();
});
