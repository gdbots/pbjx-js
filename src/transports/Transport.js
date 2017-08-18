import { TRANSPORT_AFTER_SEND, TRANSPORT_BEFORE_SEND } from '../constants';
import createResponseForFailedRequest from '../utils/createResponseForFailedRequest';
import TransportEvent from '../events/TransportEvent';
import TransportExceptionEvent from '../events/TransportExceptionEvent';

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
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async sendCommand(command) {
    const transportEvent = new TransportEvent(command, this.transportName);
    const dispatcher = this.locator.getDispatcher();
    dispatcher.dispatch(TRANSPORT_BEFORE_SEND, transportEvent);

    try {
      await this.doSendCommand(command);
    } catch (e) {
      this.locator.getExceptionHandler().onTransportException(
        new TransportExceptionEvent(command, this.transportName, e),
      );

      throw e;
    }

    dispatcher.dispatch(TRANSPORT_AFTER_SEND, transportEvent);
  }

  /**
   * Override in the transport to handle the actual send.
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async doSendCommand(command) {
    return this.locator.getCommandBus().receiveCommand(command);
  }

  /**
   * Sends an event via the transport.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async sendEvent(event) {
    const transportEvent = new TransportEvent(event, this.transportName);
    const dispatcher = this.locator.getDispatcher();
    dispatcher.dispatch(TRANSPORT_BEFORE_SEND, transportEvent);

    try {
      await this.doSendEvent(event);
    } catch (e) {
      this.locator.getExceptionHandler().onTransportException(
        new TransportExceptionEvent(event, this.transportName, e),
      );

      throw e;
    }

    dispatcher.dispatch(TRANSPORT_AFTER_SEND, transportEvent);
  }

  /**
   * Override in the transport to handle the actual send.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async doSendEvent(event) {
    return this.locator.getEventBus().receiveEvent(event);
  }

  /**
   * Sends a request via the transport.
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Promise.<Message>} Returns a message using mixin 'gdbots:pbjx:mixin:response'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async sendRequest(request) {
    const transportEvent = new TransportEvent(request, this.transportName);
    const dispatcher = this.locator.getDispatcher();
    dispatcher.dispatch(TRANSPORT_BEFORE_SEND, transportEvent);
    let response = null;

    try {
      response = await this.doSendRequest(request);
    } catch (e) {
      this.locator.getExceptionHandler().onTransportException(
        new TransportExceptionEvent(request, this.transportName, e),
      );

      response = createResponseForFailedRequest(request, e);
    }

    const transportResponseEvent = new TransportEvent(response, this.transportName);
    dispatcher.dispatch(TRANSPORT_AFTER_SEND, transportResponseEvent);

    return response;
  }

  /**
   * Override in the transport to handle the actual send.
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Promise.<Message>} Returns a message using mixin 'gdbots:pbjx:mixin:response'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async doSendRequest(request) {
    return this.locator.getRequestBus().receiveRequest(request);
  }
}
