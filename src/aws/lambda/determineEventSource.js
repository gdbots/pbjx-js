/**
 * Determines the source of the lambda event, i.e. the AWS service
 *
 * @param {Object} event - The "event" payload given to the lambda handler.
 *
 * @returns {string} Returns the service (s3, dynamodb, etc.) or "unknown"
 */
export default function determineEventSource(event) {
  const EVENT_TYPES = {
    CLOUDFRONT: 'CLOUDFRONT',
    CONGNITO: 'CONGNITO',
    DYNAMODB: 'DYNAMODB',
    KINESIS: 'KINESIS',
    KINESIS_FIREHOSE: 'KINESIS_FIREHOSE',
    S3: 'S3',
    SES: 'SES',
    SNS: 'SNS',
    SCHEDULED_EVENT: 'SCHEDULED_EVENT',
    API_GATEWAY: 'API_GATEWAY',
    UNKNOWN: 'UNKNOWN',
  };

  try {
    if (event.Records && event.Records.length > 0) {
      const record = event.Records[0];

      // Check cloudfront
      if (record.cf) {
        return EVENT_TYPES.CLOUDFRONT;
      }

      // Check dynamoDB
      if (record.dynamodb) {
        if (record.eventSource === 'aws:dynamodb') {
          return EVENT_TYPES.DYNAMODB;
        }
      }

      // Check Kinesis
      if (record.kinesis) {
        if (record.eventSource === 'aws:kinesis') {
          return EVENT_TYPES.KINESIS;
        }
      }

      // Check S3
      if (record.s3) {
        if (record.eventSource === 'aws:s3') {
          return EVENT_TYPES.S3;
        }
      }

      // Check SES
      if (record.ses) {
        if (record.eventSource === 'aws:ses') {
          return EVENT_TYPES.SES;
        }
      }

      // Check SNS
      if (record.Sns) {
        return EVENT_TYPES.SNS;
      }
    }

    // Check cognito-sync
    if (event.datasetName) {
      if (event.eventType === 'SyncTrigger') {
        if (event.identityPoolId === 'identityPoolId') {
          return EVENT_TYPES.CONGNITO;
        }
      }
    }

    // Check for scheduled events
    if (event.account) {
      if (event['detail-type'] === 'Scheduled Event') {
        if (event.source === 'aws.events') {
          return EVENT_TYPES.SCHEDULED_EVENT;
        }
      }
    }

    // Check Kinesis Firehost
    if (event.records) {
      if (event.deliveryStreamArn.indexOf('arn:aws:kinesis') === 0) {
        return EVENT_TYPES.KINESIS_FIREHOSE;
      }
    }

    // Check apiGateway event
    if (event.body) {
      if (event.resource) {
        if (event.requestContext) {
          if (event.requestContext.identity) {
            if (event.queryStringParameters) {
              if (event.headers) {
                return EVENT_TYPES.API_GATEWAY;
              }
            }
          }
        }
      }
    }

    return EVENT_TYPES.UNKNOWN;
  } catch (ex) {
    return EVENT_TYPES.UNKNOWN;
  }
}
