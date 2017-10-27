export const AWS_EVENT = {
  CLOUDFRONT: 'CLOUDFRONT',
  COGNITO_SYNC: 'COGNITO_SYNC',
  DYNAMODB: 'DYNAMODB',
  KINESIS: 'KINESIS',
  KINESIS_FIREHOSE: 'KINESIS_FIREHOSE',
  S3: 'S3',
  SES: 'SES',
  SNS: 'SNS',
  SCHEDULED: 'SCHEDULED',
  APIGATEWAY_PROXY: 'APIGATEWAY_PROXY',
  LEX: 'LEX',
  IOT_BUTTON: 'IOT_BUTTON',
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
        return AWS_EVENT.CLOUDFRONT;
      }

      // Check dynamoDB
      if (record.dynamodb) {
        if (record.eventSource === 'aws:dynamodb') {
          return AWS_EVENT.DYNAMODB;
        }
      }

      // Check Kinesis
      if (record.kinesis) {
        if (record.eventSource === 'aws:kinesis') {
          return AWS_EVENT.KINESIS;
        }
      }

      // Check S3
      if (record.s3) {
        if (record.eventSource === 'aws:s3') {
          return AWS_EVENT.S3;
        }
      }

      // Check SES
      if (record.ses) {
        if (record.eventSource === 'aws:ses') {
          return AWS_EVENT.SES;
        }
      }

      // Check SNS
      if (record.Sns) {
        return AWS_EVENT.SNS;
      }
    }

    // Check cognito-sync
    if (event.datasetName) {
      if (event.eventType === 'SyncTrigger') {
        if (event.identityPoolId === 'identityPoolId') {
          return AWS_EVENT.COGNITO_SYNC;
        }
      }
    }

    // Check Amazon lex event
    if (event.bot) {
      if (event.currentIntent) {
        return AWS_EVENT.LEX;
      }
    }

    // Check for scheduled events
    if (event.account) {
      if (event['detail-type'] === 'Scheduled Event') {
        if (event.source === 'aws.events') {
          return AWS_EVENT.SCHEDULED;
        }
      }
    }

    // Check Kinesis Firehost
    if (event.records) {
      if (event.deliveryStreamArn.indexOf('arn:aws:kinesis') === 0) {
        return AWS_EVENT.KINESIS_FIREHOSE;
      }
    }

    // Check for AWS IOT 'Button Event'
    if (event.serialNumber) {
      if (event.clickType) {
        return AWS_EVENT.IOT_BUTTON;
      }
    }

    if (event.awslogs) {
      if (event.awslogs.data) {
        return AWS_EVENT.CLOUDWATCH;
      }
    }

    if (event.configRuleArn) {
      if (event.configRuleArn.indexOf('arn:aws:config') === 0) {
        return AWS_EVENT.CONFIG;
      }
    }

    // Check apiGateway / custom event
    if (event.body) {
      if (event.resource) {
        if (event.requestContext) {
          if (event.requestContext.identity) {
            if (event.requestContext.identity.userArn === '') {
              return AWS_EVENT.CUSTOM_EVENT;
            }
            return AWS_EVENT.APIGATEWAY_PROXY;
          }
        }
      }
    }

    return AWS_EVENT.CUSTOM_EVENT;
  } catch (ex) {
    return AWS_EVENT.UNKNOWN;
  }
}
