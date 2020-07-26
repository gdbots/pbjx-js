import Exception from '@gdbots/pbj/Exception';
import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code';
import EventExecutionFailedV1 from '@gdbots/schemas/gdbots/pbjx/event/EventExecutionFailedV1';
import BusExceptionEvent from './events/BusExceptionEvent';
import getEventNames from './utils/getEventNames';

export default class EventBus {
  /**
   * @param {ServiceLocator} locator
   * @param {Transport} transport
   */
  constructor(locator, transport) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transport', { value: transport });
  }

  /**
   * Publishes events to all subscribers.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise}
   */
  async publish(event) {
    return this.transport.sendEvent(event.freeze());
  }

  /**
   * Processes an event directly.  DO NOT use this method in the application as this
   * is intended for the transports, consumers and workers of the Pbjx system.
   *
   * Publishes the event to all subscribers using the dispatcher, which processes
   * events in memory.  If any events throw an exception an EventExecutionFailed
   * event will be published.
   *
   * @internal
   * @package
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise}
   */
  async receiveEvent(event) {
    event.freeze();
    const dispatcher = await this.locator.getDispatcher();
    const pbjx = await this.locator.getPbjx();

    const listeners = [];
    getEventNames(event, '', true).forEach((eventName) => {
      listeners.push(...dispatcher.getListeners(eventName));
    });

    const promises = listeners.map(l => this.callListener(l, event, pbjx));
    return Promise.all(promises); // you knew you'd never keep
  }

  /**
   *
   * @param {function} listener - The function to call with the event.
   * @param {Message}  event    - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   * @param {Pbjx}     pbjx     - The Pbjx instance handling the event.
   *
   * @returns {Promise}
   */
  async callListener(listener, event, pbjx) {
    try {
      await listener(event, pbjx);
    } catch (e) {
      if (event.schema().getCurie().toString() === 'gdbots:pbjx:event:event-execution-failed') {
        const exceptionHandler = await this.locator.getExceptionHandler();
        await exceptionHandler.onEventBusException(new BusExceptionEvent(event, e));
        return;
      }

      let code = Code.UNKNOWN.getValue();
      if (e instanceof Exception) {
        code = e.getCode() || code;
      }

      const failedEvent = EventExecutionFailedV1.create()
        .set('event', event)
        .set('error_code', code)
        .set('error_name', e.name)
        .set('error_message', e.message.substr(0, 2048))
        .set('stack_trace', e.stack || null);

      await pbjx.copyContext(event, failedEvent);

      // running in process for now
      await this.receiveEvent(failedEvent);
    }
  }
}
