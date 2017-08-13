import {
  COMMAND_BUS_EXCEPTION,
  EVENT_BUS_EXCEPTION,
  REQUEST_BUS_EXCEPTION,
  TRANSPORT_SEND_EXCEPTION,
} from './pbjxEvents';

export default class ExceptionHandler {
  /**
   * @param {Dispatcher} dispatcher
   */
  constructor(dispatcher) {
    Object.defineProperty(this, 'dispatcher', { value: dispatcher });
  }

  /**
   * @param {BusExceptionEvent} event
   */
  onCommandBusException(event) {
    this.dispatcher.dispatch(COMMAND_BUS_EXCEPTION, event);
  }

  /**
   * @param {BusExceptionEvent} event
   */
  onEventBusException(event) {
    this.dispatcher.dispatch(EVENT_BUS_EXCEPTION, event);
  }

  /**
   * @param {BusExceptionEvent} event
   */
  onRequestBusException(event) {
    this.dispatcher.dispatch(REQUEST_BUS_EXCEPTION, event);
  }

  /**
   * @param {TransportExceptionEvent} event
   */
  onTransportException(event) {
    this.dispatcher.dispatch(TRANSPORT_SEND_EXCEPTION, event);
  }
}
