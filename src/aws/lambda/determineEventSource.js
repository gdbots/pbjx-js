/**
 * Most of the event sources come from AWS services that are found
 * in the ARN document (link below).  However, there are cases where
 * Amazon calls lambda with a payload that is part of a larger
 * service, for example, "lex" events.
 *
 * @link http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
 */
export const eventSources = {
  APIGATEWAY: 'apigateway',
  CLOUDFRONT: 'cloudfront',
  CLOUDWATCH: 'cloudwatch',
  CLOUDWATCH_EVENTS: 'events',
  CLOUDWATCH_LOGS: 'logs',
  COGNITO_SYNC: 'cognito-sync',
  CONFIG: 'config',
  DYNAMODB: 'dynamodb',
  FIREHOSE: 'firehose',
  IOT: 'iot',
  KINESIS: 'kinesis',
  LEX: 'lex', // not an actual service in an ARN
  S3: 's3',
  SES: 'ses',
  SNS: 'sns',

  /*
   * CUSTOM_EVENT type will be returned when a manual invocation of a lambda function is
   * called with a custom payload that is not structured like anything else above.
   */
  CUSTOM: 'custom',
};

/**
 * Determines the source of the lambda event, i.e. the AWS service
 *
 * @param {Object} event - The "event" payload given to the lambda handler.
 *
 * @returns {string} Returns a constant from {@see eventSources}
 */
export default (event) => {
  try {
    if (event.Records && event.Records.length > 0) {
      const record = event.Records[0];

      // Check cloudfront
      if (record.cf) {
        return eventSources.CLOUDFRONT;
      }

      // Check dynamoDB
      if (record.dynamodb && record.eventSource === 'aws:dynamodb') {
        return eventSources.DYNAMODB;
      }

      // Check Kinesis
      if (record.kinesis && record.eventSource === 'aws:kinesis') {
        return eventSources.KINESIS;
      }

      // Check S3
      if (record.s3 && record.eventSource === 'aws:s3') {
        return eventSources.S3;
      }

      // Check SES
      if (record.ses && record.eventSource === 'aws:ses') {
        return eventSources.SES;
      }

      // Check SNS
      // This is not a typo, eventsource is capitalized in different ways in different events
      if (record.Sns && record.EventSource === 'aws:sns') {
        return eventSources.SNS;
      }
    }

    // Check cognito-sync
    if (event.datasetName && event.eventType === 'SyncTrigger') {
      return eventSources.COGNITO_SYNC;
    }

    // Check Amazon lex event
    if (event.bot && event.currentIntent) {
      return eventSources.LEX;
    }

    // Check for scheduled events
    if (event.source === 'aws.events' && event['detail-type'] === 'Scheduled Event') {
      return eventSources.CLOUDWATCH_EVENTS;
    }

    // Check Kinesis Firehose
    if (event.records && event.deliveryStreamArn) {
      return eventSources.FIREHOSE;
    }

    // Check for AWS IOT 'Button Event'
    if (event.serialNumber && event.clickType) {
      return eventSources.IOT;
    }

    if (event.awslogs) {
      return eventSources.CLOUDWATCH_LOGS;
    }

    if (event.configRuleArn) {
      return eventSources.CONFIG;
    }

    // Check apiGateway / custom event via api gateway
    if (event.requestContext && event.requestContext.apiId) {
      return eventSources.APIGATEWAY;
    }

    return eventSources.CUSTOM;
  } catch (ex) {
    return eventSources.CUSTOM;
  }
};
