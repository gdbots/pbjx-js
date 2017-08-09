/**
 * Suffixes are typically used by @see Pbjx::trigger
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
export const COMMAND_BUS_EXCEPTION = 'gdbots_pbjx.command_bus.exception';

/**
 * Occurs during event dispatching, where events are actually handled.  If the
 * subscriber throws an exception and the EventExecutionFailed also fails
 * to be handled, then this event is announced.  This should be very rare.
 *
 * @see {BusExceptionEvent}
 */
export const EVENT_BUS_EXCEPTION = 'gdbots_pbjx.event_bus.exception';

/**
 * Occurs during request handling when an exception is not properly
 * handled and converted to a RequestFailedResponse response.
 *
 * @see {BusExceptionEvent}
 */
export const REQUEST_BUS_EXCEPTION = 'gdbots_pbjx.request_bus.exception';

/**
 * Occurs prior to the message being sent by the transport.
 *
 * @see {TransportEvent}
 */
export const TRANSPORT_BEFORE_SEND = 'gdbots_pbjx.transport.before_send';

/**
 * Occurs after the message has been successfully sent by the transport.
 *
 * @see {TransportEvent}
 */
export const TRANSPORT_AFTER_SEND = 'gdbots_pbjx.transport.after_send';

/**
 * Occurs if the transport throws an exception during the send.
 *
 * @see {TransportExceptionEvent}
 */
export const TRANSPORT_SEND_EXCEPTION = 'gdbots_pbjx.transport.send_exception';

/**
 * Occurs before a job/task/message has been handled by a consumer.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_BEFORE_HANDLE = 'gdbots_pbjx.consumer.before_handle';

/**
 * Occurs after a job/task/message has been handled by a consumer.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_AFTER_HANDLE = 'gdbots_pbjx.consumer.after_handle';

/**
 * Occurs if an exception is thrown during message handling.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_HANDLING_EXCEPTION = 'gdbots_pbjx.consumer.handling_exception';

/**
 * Occurs after the consumer has stopped and finished its teardown.
 *
 * @see {PbjxEvent}
 */
export const CONSUMER_AFTER_TEARDOWN = 'gdbots_pbjx.consumer.after_teardown';
