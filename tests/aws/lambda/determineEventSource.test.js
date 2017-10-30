import test from 'tape';
import determineEventSource, { eventSources } from '../../../src/aws/lambda/determineEventSource';
import mockEventApiGateway from './sample-events/apigateway-proxy.json';
import mockEventCloudfront from './sample-events/cloudfront.json';
import mockEventCognitoSync from './sample-events/cognito-sync.json';
import mockEventDynamoDB from './sample-events/dynamodb.json';
import mockEventIotButton from './sample-events/iot-button.json';
import mockEventKinesis from './sample-events/kinesis.json';
import mockEventKinesisFirehose from './sample-events/kinesis-firehose.json';
import mockEventLex from './sample-events/lex.json';
import mockEventS3 from './sample-events/s3.json';
import mockEventScheduled from './sample-events/scheduled-event.json';
import mockEventSes from './sample-events/ses.json';
import mockEventSns from './sample-events/sns.json';

const eventTypeMatches = (event, expected) => determineEventSource(event) === expected;

test('determineEventSource tests', (t) => {
  t.ok(eventTypeMatches(mockEventApiGateway, eventSources.APIGATEWAY_PROXY));
  t.ok(eventTypeMatches(mockEventCloudfront, eventSources.CLOUDFRONT));
  t.ok(eventTypeMatches(mockEventCognitoSync, eventSources.COGNITO_SYNC));
  t.ok(eventTypeMatches(mockEventDynamoDB, eventSources.DYNAMODB));
  t.ok(eventTypeMatches(mockEventIotButton, eventSources.IOT_BUTTON));
  t.ok(eventTypeMatches(mockEventKinesis, eventSources.KINESIS));
  t.ok(eventTypeMatches(mockEventKinesisFirehose, eventSources.KINESIS_FIREHOSE));
  t.ok(eventTypeMatches(mockEventLex, eventSources.LEX));
  t.ok(eventTypeMatches(mockEventS3, eventSources.S3));
  t.ok(eventTypeMatches(mockEventScheduled, eventSources.SCHEDULED));
  t.ok(eventTypeMatches(mockEventSes, eventSources.SES));
  t.ok(eventTypeMatches(mockEventSns, eventSources.SNS));
  t.end();
});

