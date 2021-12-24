import test from 'tape';
import { readFile } from 'fs/promises';
import determineEventSource, { eventSources } from '../../../src/aws/lambda/determineEventSource.js';

const r = async (file) => JSON.parse(await readFile(new URL(file, import.meta.url)));

// fixme: test more aws sample events
test('determineEventSource tests', async (t) => {
  t.same(determineEventSource(await r('./sample-events/apigateway.json')), eventSources.APIGATEWAY);
  t.same(determineEventSource(await r('./sample-events/cloudfront.json')), eventSources.CLOUDFRONT);
  t.same(determineEventSource(await r('./sample-events/cloudwatch-events.json')), eventSources.CLOUDWATCH_EVENTS);
  t.same(determineEventSource(await r('./sample-events/cognito-sync.json')), eventSources.COGNITO_SYNC);
  t.same(determineEventSource(await r('./sample-events/dynamodb.json')), eventSources.DYNAMODB);
  t.same(determineEventSource(await r('./sample-events/firehose.json')), eventSources.FIREHOSE);
  t.same(determineEventSource(await r('./sample-events/iot.json')), eventSources.IOT);
  t.same(determineEventSource(await r('./sample-events/kinesis.json')), eventSources.KINESIS);
  t.same(determineEventSource(await r('./sample-events/lex.json')), eventSources.LEX);
  t.same(determineEventSource(await r('./sample-events/s3.json')), eventSources.S3);
  t.same(determineEventSource(await r('./sample-events/ses.json')), eventSources.SES);
  t.same(determineEventSource(await r('./sample-events/sns.json')), eventSources.SNS);
  t.same(determineEventSource({ custom: 'something' }), eventSources.CUSTOM);
  t.same(determineEventSource(false), eventSources.CUSTOM);
  t.same(determineEventSource(null), eventSources.CUSTOM);
  t.end();
});
