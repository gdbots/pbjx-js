export const eventSources = {
  APIGATEWAY_PROXY: 'APIGATEWAY_PROXY',
  CLOUDFRONT: 'CLOUDFRONT',
  COGNITO_SYNC: 'COGNITO_SYNC',
  DYNAMODB: 'DYNAMODB',
  IOT_BUTTON: 'IOT_BUTTON',
  KINESIS: 'KINESIS',
  KINESIS_FIREHOSE: 'KINESIS_FIREHOSE',
  S3: 'S3',
  SCHEDULED: 'SCHEDULED',
  SES: 'SES',
  SNS: 'SNS',
  LEX: 'LEX',
  CLOUDWATCH: 'CLOUDWATCH',
  CONFIG: 'CONFIG',
  UNKNOWN: 'UNKNOWN',
  /**
   * CUSTOM_EVENT type will be returned when a manual invocation of a lambda function is
   * called with a custom payload that is not structured like a APIGATEWAY_PROXY event.
   */
  CUSTOM_EVENT: 'CUSTOM_EVENT',
};

/**
 * Determines the source of the lambda event, i.e. the AWS service
 *
 * @param {Object} event - The "event" payload given to the lambda handler.
 *
 * @returns {string} Returns the service (s3, dynamodb, etc.) or "unknown"
 */
export default function determineEventSource(event) {
  try {
    if (event.Records && event.Records.length > 0) {
      const record = event.Records[0];

      // Check cloudfront
      if (record.cf) {
        return eventSources.CLOUDFRONT;
      }

      // Check dynamoDB
      if (record.dynamodb) {
        if (record.eventSource === 'aws:dynamodb') {
          return eventSources.DYNAMODB;
        }
      }

      // Check Kinesis
      if (record.kinesis) {
        if (record.eventSource === 'aws:kinesis') {
          return eventSources.KINESIS;
        }
      }

      // Check S3
      if (record.s3) {
        if (record.eventSource === 'aws:s3') {
          return eventSources.S3;
        }
      }

      // Check SES
      if (record.ses) {
        if (record.eventSource === 'aws:ses') {
          return eventSources.SES;
        }
      }

      // Check SNS
      if (record.Sns) {
        return eventSources.SNS;
      }
    }

    // Check cognito-sync
    if (event.datasetName) {
      if (event.eventType === 'SyncTrigger') {
        if (event.identityPoolId === 'identityPoolId') {
          return eventSources.COGNITO_SYNC;
        }
      }
    }

    // Check Amazon lex event
    if (event.bot) {
      if (event.currentIntent) {
        return eventSources.LEX;
      }
    }

    // Check for scheduled events
    if (event.account) {
      if (event['detail-type'] === 'Scheduled Event') {
        if (event.source === 'aws.events') {
          return eventSources.SCHEDULED;
        }
      }
    }

    // Check Kinesis Firehost
    if (event.records) {
      if (event.deliveryStreamArn.indexOf('arn:aws:kinesis') === 0) {
        return eventSources.KINESIS_FIREHOSE;
      }
    }

    // Check for AWS IOT 'Button Event'
    if (event.serialNumber) {
      if (event.clickType) {
        return eventSources.IOT_BUTTON;
      }
    }

    if (event.awslogs) {
      if (event.awslogs.data) {
        return eventSources.CLOUDWATCH;
      }
    }

    if (event.configRuleArn) {
      if (event.configRuleArn.indexOf('arn:aws:config') === 0) {
        return eventSources.CONFIG;
      }
    }

    // Check apiGateway / custom event via api gateway
    if (event.body) {
      if (event.resource) {
        if (event.requestContext) {
          if (event.requestContext.identity) {
            return eventSources.APIGATEWAY_PROXY;
          }
        }
      }
    }

    return eventSources.CUSTOM_EVENT;
  } catch (ex) {
    return eventSources.UNKNOWN;
  }
}
