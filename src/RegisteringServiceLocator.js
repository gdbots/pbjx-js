import HandlerNotFound from './exceptions/HandlerNotFound';
import ServiceLocator from './ServiceLocator';

const handlers = Symbol('handlers');

/**
 * This service locator requires that you register the handlers
 * for all commands/requests.  Not ideal for large apps but
 * convenient and simple for test cases and very small apps.
 *
 * In most cases you'll use a {@see ContainerAwareServiceLocator}.
 */
export default class RegisteringServiceLocator extends ServiceLocator {
  constructor() {
    super();
    this[handlers] = new Map();
  }

  /**
   * @returns {{handleCommand: function}}
   */
  async getCommandHandler(curie) {
    return this.getHandler(curie);
  }

  /**
   * @returns {{handleRequest: function}}
   */
  async getRequestHandler(curie) {
    return this.getHandler(curie);
  }

  /**
   * @param {SchemaCurie} curie
   * @param {{handleCommand: function}} handler
   */
  registerCommandHandler(curie, handler) {
    this[handlers].set(curie.toString(), handler);
  }

  /**
   * @param {SchemaCurie} curie
   * @param {{handleRequest: function}} handler
   */
  registerRequestHandler(curie, handler) {
    this[handlers].set(curie.toString(), handler);
  }

  /**
   * @private
   *
   * @param {SchemaCurie} curie
   *
   * @returns {{handleCommand: function}|{handleRequest: function}}
   *
   * @throws {HandlerNotFound}
   */
  async getHandler(curie) {
    const id = curie.toString();

    if (this[handlers].has(id)) {
      return this[handlers].get(id);
    }

    throw new HandlerNotFound(curie);
  }
}
