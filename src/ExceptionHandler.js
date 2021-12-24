import {
  COMMAND_BUS_EXCEPTION,
  EVENT_BUS_EXCEPTION,
  TRANSPORT_SEND_EXCEPTION,
  TRIGGER_EXCEPTION
} from './constants.js';
import TriggerExceptionEvent from './events/TriggerExceptionEvent.js';

export default class ExceptionHandler {
  /**
   * @param {Dispatcher} dispatcher
   */
  constructor(dispatcher) {
    Object.defineProperty(this, 'dispatcher', { value: dispatcher });
  }

  /**
   * @param {PbjxEvent} event
   * @param {string} eventName
   * @param {Exception|Error} exception
   */
  async onTriggerException(event, eventName, exception) {
    const message = event.getMessage();
    await this.dispatcher.dispatch(TRIGGER_EXCEPTION, new TriggerExceptionEvent(message, eventName, exception));
  }

  /**
   * @param {BusExceptionEvent} event
   */
  async onCommandBusException(event) {
    await this.dispatcher.dispatch(COMMAND_BUS_EXCEPTION, event);
  }

  /**
   * @param {BusExceptionEvent} event
   */
  async onEventBusException(event) {
    await this.dispatcher.dispatch(EVENT_BUS_EXCEPTION, event);
  }

  /**
   * @param {BusExceptionEvent} event
   */
  async onRequestBusException(event) {
    // because we throw the exception in Pbjx.request
    // we don't need to log it, something up the chain will.
    //this.dispatcher.dispatch(REQUEST_BUS_EXCEPTION, event);
  }

  /**
   * @param {TransportExceptionEvent} event
   */
  async onTransportException(event) {
    await this.dispatcher.dispatch(TRANSPORT_SEND_EXCEPTION, event);
  }
}
