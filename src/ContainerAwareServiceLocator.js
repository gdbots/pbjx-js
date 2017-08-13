/* eslint-disable class-methods-use-this */
import HandlerNotFound from './exceptions/HandlerNotFound';
import ServiceLocator from './ServiceLocator';
import CommandBus from './CommandBus';
import EventBus from './EventBus';
import RequestBus from './RequestBus';
import curieToHandlerServiceId from './utils/curieToHandlerServiceId';

const sid = id => `@gdbots/pbjx/${id}`;

export default class ContainerAwareServiceLocator extends ServiceLocator {
  /**
   * @param {Object} container
   */
  constructor(container) {
    super();
    Object.defineProperty(this, 'container', { value: container });
  }

  /**
   * {@inheritDoc}
   */
  doGetPbjx() {
    const id = 'pbjx';
    if (!this.container.has(id)) {
      return super.doGetPbjx();
    }

    return this.container.get(id);
  }

  /**
   * {@inheritDoc}
   */
  doGetDispatcher() {
    const id = sid('dispatcher');
    if (!this.container.has(id)) {
      return super.doGetDispatcher();
    }

    return this.container.get(id);
  }

  /**
   * {@inheritDoc}
   */
  doGetCommandBus() {
    return new CommandBus(this, this.getTransportForBus(sid('command_bus/transport')));
  }

  /**
   * {@inheritDoc}
   */
  doGetEventBus() {
    return new EventBus(this, this.getTransportForBus(sid('event_bus/transport')));
  }

  /**
   * {@inheritDoc}
   */
  doGetRequestBus() {
    return new RequestBus(this, this.getTransportForBus(sid('request_bus/transport')));
  }

  /**
   * {@inheritDoc}
   */
  doGetExceptionHandler() {
    const id = sid('exception_handler');
    if (!this.container.has(id)) {
      return super.doGetExceptionHandler();
    }

    return this.container.get(id);
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
   * @private
   *
   * @param {SchemaCurie} curie
   *
   * @returns {CommandHandler|RequestHandler}
   *
   * @throws {HandlerNotFound}
   */
  getHandler(curie) {
    try {
      return this.container.get(curieToHandlerServiceId(curie));
    } catch (e) {
      throw new HandlerNotFound(curie);
    }
  }

  /**
   * @private
   *
   * @param {string} id - Container entry id with the bus to use.
   *
   * @returns {Transport}
   *
   * @throws {Exception}
   */
  getTransportForBus(id) {
    if (!this.container.has(id)) {
      return this.getDefaultTransport();
    }

    return this.container.get(sid(`transports/${this.container.get(id)}`));
  }
}
