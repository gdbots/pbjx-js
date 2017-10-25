import AWS_EVENT from '../Event';

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

    // Check for scheduled events
    if (event.account) {
      if (event['detail-type'] === 'Scheduled Event') {
        if (event.source === 'aws.events') {
          return AWS_EVENT.SCHEDULED_EVENT;
        }
      }
    }

    // Check Kinesis Firehost
    if (event.records) {
      if (event.deliveryStreamArn.indexOf('arn:aws:kinesis') === 0) {
        return AWS_EVENT.KINESIS_FIREHOSE;
      }
    }

    // Check apiGateway event
    if (event.body) {
      if (event.resource) {
        if (event.requestContext) {
          if (event.requestContext.identity) {
            if (event.queryStringParameters) {
              if (event.headers) {
                return AWS_EVENT.APIGATEWAY_PROXY;
              }
            }
          }
        }
      }
    }

    return AWS_EVENT.UNKNOWN;
  } catch (ex) {
    return AWS_EVENT.UNKNOWN;
  }
}
