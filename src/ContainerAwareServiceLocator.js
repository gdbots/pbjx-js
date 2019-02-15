import { serviceIds } from './constants';
import HandlerNotFound from './exceptions/HandlerNotFound';
import ServiceLocator from './ServiceLocator';
import CommandBus from './CommandBus';
import EventBus from './EventBus';
import RequestBus from './RequestBus';
import curieToHandlerServiceId from './utils/curieToHandlerServiceId';

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
    if (!this.container.has(serviceIds.PBJX)) {
      return super.doGetPbjx();
    }

    return this.container.get(serviceIds.PBJX);
  }

  /**
   * {@inheritDoc}
   */
  doGetDispatcher() {
    if (!this.container.has(serviceIds.DISPATCHER)) {
      return super.doGetDispatcher();
    }

    return this.container.get(serviceIds.DISPATCHER);
  }

  /**
   * {@inheritDoc}
   */
  doGetCommandBus() {
    return new CommandBus(this, this.getTransportForBus(serviceIds.COMMAND_BUS_TRANSPORT));
  }

  /**
   * {@inheritDoc}
   */
  doGetEventBus() {
    return new EventBus(this, this.getTransportForBus(serviceIds.EVENT_BUS_TRANSPORT));
  }

  /**
   * {@inheritDoc}
   */
  doGetRequestBus() {
    return new RequestBus(this, this.getTransportForBus(serviceIds.REQUEST_BUS_TRANSPORT));
  }

  /**
   * {@inheritDoc}
   */
  doGetExceptionHandler() {
    if (!this.container.has(serviceIds.EXCEPTION_HANDLER)) {
      return super.doGetExceptionHandler();
    }

    return this.container.get(serviceIds.EXCEPTION_HANDLER);
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

    return this.container.get(`${serviceIds.TRANSPORT_PREFIX}${this.container.get(id)}`);
  }
}
