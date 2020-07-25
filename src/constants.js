export const SERVICE_PREFIX = '@gdbots/pbjx/';
export const EVENT_PREFIX = SERVICE_PREFIX;
const t = id => `${EVENT_PREFIX}${id}`;

/**
 * When using a {@see ContainerAwareServiceLocator} the services
 * and parameters are located using these identifiers.
 *
 * @link https://martinfowler.com/articles/injection.html#UsingAServiceLocator
 *
 * @type {Object}
 */
export const serviceIds = {
  PREFIX: SERVICE_PREFIX,

  // core pbjx services
  PBJX: t('pbjx'),
  DISPATCHER: t('dispatcher'),
  EXCEPTION_HANDLER: t('exception_handler'),
  LOCATOR: t('locator'),

  // bus configs (e.g. firehose, http, in_memory, lambda)
  COMMAND_BUS_TRANSPORT: t('command_bus/transport'),
  EVENT_BUS_TRANSPORT: t('event_bus/transport'),
  REQUEST_BUS_TRANSPORT: t('request_bus/transport'),

  // transports
  TRANSPORT_PREFIX: t('transports/'),
  TRANSPORT_FIREHOSE: t('transports/firehose'),
  TRANSPORT_HTTP: t('transports/http'),
  TRANSPORT_HTTP_ENDPOINT: t('transports/http/endpoint'),
  TRANSPORT_IN_MEMORY: t('transports/in_memory'),
  TRANSPORT_LAMBDA: t('transports/lambda'),

  // handlers
  CHECK_HEALTH_HANDLER: t('check_health_handler'),
  ECHO_REQUEST_HANDLER: t('echo_request_handler'),

  // redux
  REDUX_REDUCER: t('redux/reducer'),
};

/**
 * Access Tokens (aka Bearer Token) can be used with transports
 * that support authentication via an "Authorization" header.
 * When reading/writing the access tokens, use these keys.
 */
export const ACCESS_TOKEN_STORAGE_KEY = 'pbjx.accessToken';
export const ACCESS_TOKEN_ENV_KEY = 'PBJX_ACCESS_TOKEN';

/**
 * Suffixes are typically used by {@see Pbjx.trigger}
 * The actual event name is a combination of curies, mixins, etc. on the
 * message plus a suffix.  The event payload will be a PbjxEvent or a
 * subclass of that.
 *
 * @see {PbjxEvent}
 */
export const SUFFIX_BIND = 'bind';
export const SUFFIX_VALIDATE = 'validate';
export const SUFFIX_ENRICH = 'enrich';
export const SUFFIX_BEFORE_HANDLE = 'before_handle';
export const SUFFIX_AFTER_HANDLE = 'after_handle';
export const SUFFIX_CREATED = 'created';
export const SUFFIX_UPDATED = 'updated';
export const SUFFIX_DELETED = 'deleted';

/**
 * Occurs prior to an expection being thrown during the handling phase of a command.
 * This is not announced during validate, enrich or the transport send.
 *
 * @see {BusExceptionEvent}
 */
export const COMMAND_BUS_EXCEPTION = t('command_bus.exception');

/**
 * Occurs during event dispatching, where events are actually handled.  If the
 * subscriber throws an exception and the EventExecutionFailed also fails
 * to be handled, then this event is announced.  This should be very rare.
 *
 * @see {BusExceptionEvent}
 */
export const EVENT_BUS_EXCEPTION = t('event_bus.exception');

/**
 * Occurs during request handling when an exception is not properly
 * handled and converted to a RequestFailedResponse response.
 *
 * @see {BusExceptionEvent}
 */
export const REQUEST_BUS_EXCEPTION = t('request_bus.exception');

/**
 * Occurs prior to the message being sent by the transport.
 *
 * @see {TransportEvent}
 */
export const TRANSPORT_BEFORE_SEND = t('transport.before_send');

/**
 * Occurs after the message has been successfully sent by the transport.
 *
 * @see {TransportEvent}
 */
export const TRANSPORT_AFTER_SEND = t('transport.after_send');

/**
 * Occurs if the transport throws an exception during the send.
 *
 * @see {TransportExceptionEvent}
 */
export const TRANSPORT_SEND_EXCEPTION = t('transport.send_exception');

/**
 * Occurs when the {@see HttpTransport} receives an Envelope from a PBJX HTTP service.
 * The envelope sometimes carries out of band information and an event subscriber
 * would need to extract that data to make use of it.
 *
 * @see {EnvelopeReceivedEvent}
 */
export const TRANSPORT_HTTP_ENVELOPE_RECEIVED = t('transport.http.envelope_received');

/**
 * Occurs before a job/task/message has been handled by a consumer.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_BEFORE_HANDLE = t('consumer.before_handle');

/**
 * Occurs after a job/task/message has been handled by a consumer.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_AFTER_HANDLE = t('consumer.after_handle');

/**
 * Occurs if an exception is thrown during message handling.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_HANDLING_EXCEPTION = t('consumer.handling_exception');

/**
 * Occurs after the consumer has stopped and finished its teardown.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_AFTER_TEARDOWN = t('consumer.after_teardown');
