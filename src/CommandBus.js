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
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async send(command) {
    return this.transport.sendCommand(command.freeze());
  }

  /**
   * Processes a command directly.  DO NOT use this method in the application as this
   * is intended for the transports, consumers and workers of the Pbjx system.
   *
   * Invokes the handler that services the given command.  If an exception occurs
   * it will be processed by the exception handler and not thrown by this method.
   *
   * It is up to the handler or exception handler to retry the command (if appropriate)
   * or message the user in some way that their command has failed.  This process is
   * expected to be running asynchronously and very likely in a background process so
   * allowing an exception to just bubble up and break the service handling commands
   * will not be seen by anyone except an error log.
   *
   * @internal
   * @package
   *
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   */
  async receiveCommand(command) {
    let handler;

    try {
      handler = this.locator.getCommandHandler(command.schema().getCurie());
    } catch (e) {
      this.locator.getExceptionHandler().onCommandBusException(new BusExceptionEvent(command, e));
      return;
    }

    try {
      command.freeze();
      const pbjx = this.locator.getPbjx();
      const event = new PbjxEvent(command);
      pbjx.trigger(command, SUFFIX_BEFORE_HANDLE, event, false);
      await handler.handleCommand(command, pbjx);
      pbjx.trigger(command, SUFFIX_AFTER_HANDLE, event, false);
    } catch (e) {
      this.locator.getExceptionHandler().onCommandBusException(new BusExceptionEvent(command, e));
    }
  }
}
