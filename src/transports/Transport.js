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
}
