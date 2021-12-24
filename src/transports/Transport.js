import { TRANSPORT_AFTER_SEND, TRANSPORT_BEFORE_SEND } from '../constants.js';
import createResponseForFailedRequest from '../utils/createResponseForFailedRequest.js';
import TransportEvent from '../events/TransportEvent.js';
import TransportExceptionEvent from '../events/TransportExceptionEvent.js';

export default class Transport {
  /**
   * @param {ServiceLocator} locator
   * @param {string} transportName
   */
  constructor(locator, transportName) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transportName', { value: transportName });
  }

  /**
   * Sends a command via the transport.
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @returns {Promise}
   */
  async sendCommand(command) {
    const transportEvent = new TransportEvent(command, this.transportName);
    const dispatcher = await this.locator.getDispatcher();
    await dispatcher.dispatch(TRANSPORT_BEFORE_SEND, transportEvent);

    try {
      await this.doSendCommand(command);
    } catch (e) {
      const exceptionHandler = await this.locator.getExceptionHandler();
      await exceptionHandler.onTransportException(new TransportExceptionEvent(command, this.transportName, e));
      throw e;
    }

    await dispatcher.dispatch(TRANSPORT_AFTER_SEND, transportEvent);
  }

  /**
   * Override in the transport to handle the actual send.
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @returns {Promise}
   */
  async doSendCommand(command) {
    const bus = await this.locator.getCommandBus();
    return bus.receiveCommand(command);
  }

  /**
   * Sends an event via the transport.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise}
   */
  async sendEvent(event) {
    const transportEvent = new TransportEvent(event, this.transportName);
    const dispatcher = await this.locator.getDispatcher();
    await dispatcher.dispatch(TRANSPORT_BEFORE_SEND, transportEvent);

    try {
      await this.doSendEvent(event);
    } catch (e) {
      const exceptionHandler = await this.locator.getExceptionHandler();
      await exceptionHandler.onTransportException(new TransportExceptionEvent(event, this.transportName, e));
      throw e;
    }

    await dispatcher.dispatch(TRANSPORT_AFTER_SEND, transportEvent);
  }

  /**
   * Override in the transport to handle the actual send.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise}
   */
  async doSendEvent(event) {
    const bus = await this.locator.getEventBus();
    return bus.receiveEvent(event);
  }

  /**
   * Sends a request via the transport.
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Promise.<Message>} Resolves with a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async sendRequest(request) {
    const transportEvent = new TransportEvent(request, this.transportName);
    const dispatcher = await this.locator.getDispatcher();
    await dispatcher.dispatch(TRANSPORT_BEFORE_SEND, transportEvent);
    let response;

    try {
      response = await this.doSendRequest(request);
    } catch (e) {
      const exceptionHandler = await this.locator.getExceptionHandler();
      await exceptionHandler.onTransportException(new TransportExceptionEvent(request, this.transportName, e));
      response = createResponseForFailedRequest(request, e);
    }

    const transportResponseEvent = new TransportEvent(response, this.transportName);
    await dispatcher.dispatch(TRANSPORT_AFTER_SEND, transportResponseEvent);

    return response;
  }

  /**
   * Override in the transport to handle the actual send.
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Promise.<Message>} Resolves with a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async doSendRequest(request) {
    const bus = await this.locator.getRequestBus();
    return bus.receiveRequest(request);
  }
}
