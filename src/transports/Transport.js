import Exception from '@gdbots/common/Exception';
import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code';
import RequestFailedResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/RequestFailedResponseV1';
import { TRANSPORT_AFTER_SEND, TRANSPORT_BEFORE_SEND } from '../constants';
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
        new TransportExceptionEvent(command, this.transportName, e)
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
        new TransportExceptionEvent(event, this.transportName, e)
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
   * @returns {Message} Returns a message using mixin 'gdbots:pbjx:mixin:response'
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
        new TransportExceptionEvent(request, this.transportName, e)
      );

      response = this.createResponseForFailedRequest(request, e);
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
   * @returns {Message} Returns a message using mixin 'gdbots:pbjx:mixin:response'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async doSendRequest(request) {
    return this.locator.getRequestBus().receiveRequest(request);
  }

  /**
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   * @param {Error|Exception} exception
   *
   * @returns {Message} Returns a message using mixin 'gdbots:pbjx:mixin:response'
   */
  createResponseForFailedRequest(request, exception) {
    let code = Code.UNKNOWN.getValue();
    if (exception instanceof Exception) {
      code = exception.getCode() || code;
    }

    const response = new RequestFailedResponseV1.create()
      .set('ctx_request_ref', request.generateMessageRef())
      .set('ctx_request', request)
      .set('error_code', code)
      .set('error_name', exception.name)
      .set('error_message', exception.message.substr(0, 2048))
      .set('stack_trace', exception.stack || null);

    if (request.has('ctx_correlator_ref')) {
      response.set('ctx_correlator_ref', request.get('ctx_correlator_ref'));
    }

    return response;
  }
}
