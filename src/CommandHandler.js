/* eslint-disable class-methods-use-this, no-unused-vars */
import LogicException from './exceptions/LogicException';

/**
 * Extend this class on all of your command handlers.
 * Currently this serves as a marker/tag interface.
 */
export default class CommandHandler {
  /**
   * @param {Message} command - Expected to be a message using mixin 'gdbots:pbjx:mixin:command'
   * @param {Pbjx}    pbjx    - The Pbjx instance handling the command.
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async handleCommand(command, pbjx) {
    throw new LogicException(`Method "handleCommand" must be implemented on the handler for "${command.schema().getCurie()}.`);
  }
}
