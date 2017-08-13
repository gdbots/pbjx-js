import HandlerNotFound from './exceptions/HandlerNotFound';
import ServiceLocator from './ServiceLocator';

const privateProps = new WeakMap();

/**
 * This service locator requires that you register the handlers
 * for all commands/requests.  Not ideal for large apps but
 * convenient and simple for test cases and very small apps.
 *
 * In most cases you'll use a ContainerAwareServiceLocator.
 */
export default class RegisteringServiceLocator extends ServiceLocator {
  constructor() {
    super();
    privateProps.set(this, { handlers: new Map() });
  }

  /**
   * {@inheritDoc}
   */
  getCommandHandler(curie) {
    return this.getHandler(curie);
  }

  /**
   * {@inheritDoc}
   */
  getRequestHandler(curie) {
    return this.getHandler(curie);
  }

  /**
   * @param {SchemaCurie} curie
   * @param {CommandHandler} handler
   */
  registerCommandHandler(curie, handler) {
    privateProps.get(this).handlers.set(curie.toString(), handler);
  }

  /**
   * @param {SchemaCurie} curie
   * @param {RequestHandler} handler
   */
  registerRequestHandler(curie, handler) {
    privateProps.get(this).handlers.set(curie.toString(), handler);
  }

  /**
   * @private
   *
   * @param {SchemaCurie} curie
   *
   * @returns {CommandHandler|RequestHandler}
   *
   * @throws {HandlerNotFound}
   */
  getHandler(curie) {
    const handlers = privateProps.get(this).handlers;
    const id = curie.toString();

    if (handlers.has(id)) {
      return handlers.get(id);
    }

    throw new HandlerNotFound(curie);
  }
}
