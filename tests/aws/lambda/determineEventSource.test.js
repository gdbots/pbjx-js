import test from 'tape';
import determineEventSource, { eventSources } from '../../../src/aws/lambda/determineEventSource';
import sampleApiGateway from './sample-events/apigateway.json';
import sampleCloudfront from './sample-events/cloudfront.json';
import sampleCloudWatchEvents from './sample-events/cloudwatch-events.json';
import sampleCognitoSync from './sample-events/cognito-sync.json';
import sampleDynamoDB from './sample-events/dynamodb.json';
import sampleFirehose from './sample-events/firehose.json';
import sampleIot from './sample-events/iot.json';
import sampleKinesis from './sample-events/kinesis.json';
import sampleLex from './sample-events/lex.json';
import sampleS3 from './sample-events/s3.json';
import sampleSes from './sample-events/ses.json';
import sampleSns from './sample-events/sns.json';

// fixme: test more aws sample events
test('determineEventSource tests', (t) => {
  t.same(determineEventSource(sampleApiGateway), eventSources.APIGATEWAY);
  t.same(determineEventSource(sampleCloudfront), eventSources.CLOUDFRONT);
  t.same(determineEventSource(sampleCloudWatchEvents), eventSources.CLOUDWATCH_EVENTS);
  t.same(determineEventSource(sampleCognitoSync), eventSources.COGNITO_SYNC);
  t.same(determineEventSource(sampleDynamoDB), eventSources.DYNAMODB);
  t.same(determineEventSource(sampleFirehose), eventSources.FIREHOSE);
  t.same(determineEventSource(sampleIot), eventSources.IOT);
  t.same(determineEventSource(sampleKinesis), eventSources.KINESIS);
  t.same(determineEventSource(sampleLex), eventSources.LEX);
  t.same(determineEventSource(sampleS3), eventSources.S3);
  t.same(determineEventSource(sampleSes), eventSources.SES);
  t.same(determineEventSource(sampleSns), eventSources.SNS);
  t.same(determineEventSource({ custom: 'something' }), eventSources.CUSTOM);
  t.same(determineEventSource(false), eventSources.CUSTOM);
  t.same(determineEventSource(null), eventSources.CUSTOM);
  t.end();
});
