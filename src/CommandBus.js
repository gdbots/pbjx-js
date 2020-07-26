import { SUFFIX_AFTER_HANDLE, SUFFIX_BEFORE_HANDLE } from './constants';
import BusExceptionEvent from './events/BusExceptionEvent';
import PbjxEvent from './events/PbjxEvent';

export default class CommandBus {
  /**
   * @param {ServiceLocator} locator
   * @param {Transport} transport
   */
  constructor(locator, transport) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transport', { value: transport });
  }

  /**
   * Processes a command asynchronously.
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @returns {Promise}
   */
  async send(command) {
    return this.transport.sendCommand(command.freeze());
  }

  /**
   * Invokes the handler that services the given command.  If an exception occurs
   * it will be processed by the exception handler and rethrown.
   *
   * @internal
   * @package
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   *
   * @returns {Promise}
   */
  async receiveCommand(command) {
    try {
      const handler = await this.locator.getCommandHandler(command.schema().getCurie());
      command.freeze();
      const pbjx = await this.locator.getPbjx();
      const event = new PbjxEvent(command);
      await pbjx.trigger(command, SUFFIX_BEFORE_HANDLE, event, false);
      await handler.handleCommand(command, pbjx);
      await pbjx.trigger(command, SUFFIX_AFTER_HANDLE, event, false);
    } catch (e) {
      const exceptionHandler = await this.locator.getExceptionHandler();
      await exceptionHandler.onCommandBusException(new BusExceptionEvent(command, e));
      throw e;
    }
  }
}
