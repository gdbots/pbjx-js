import { serviceIds } from './constants.js';
import HandlerNotFound from './exceptions/HandlerNotFound.js';
import ServiceLocator from './ServiceLocator.js';
import CommandBus from './CommandBus.js';
import EventBus from './EventBus.js';
import RequestBus from './RequestBus.js';
import curieToHandlerServiceId from './utils/curieToHandlerServiceId.js';

export default class ContainerAwareServiceLocator extends ServiceLocator {
  /**
   * @param {{get: function, has: function, getParameter: function, hasParameter: function}} container
   */
  constructor(container) {
    super();
    Object.defineProperty(this, 'container', { value: container });
  }

  /**
   * @returns {Pbjx}
   */
  async doGetPbjx() {
    if (!this.container.has(serviceIds.PBJX)) {
      return super.doGetPbjx();
    }

    return this.container.get(serviceIds.PBJX);
  }

  /**
   * @returns {Dispatcher}
   */
  async doGetDispatcher() {
    if (!this.container.has(serviceIds.DISPATCHER)) {
      return super.doGetDispatcher();
    }

    return this.container.get(serviceIds.DISPATCHER);
  }

  /**
   * @returns {CommandBus}
   */
  async doGetCommandBus() {
    return new CommandBus(this, await this.getTransportForBus(serviceIds.COMMAND_BUS_TRANSPORT));
  }

  /**
   * @returns {EventBus}
   */
  async doGetEventBus() {
    return new EventBus(this, await this.getTransportForBus(serviceIds.EVENT_BUS_TRANSPORT));
  }

  /**
   * @returns {RequestBus}
   */
  async doGetRequestBus() {
    return new RequestBus(this, await this.getTransportForBus(serviceIds.REQUEST_BUS_TRANSPORT));
  }

  /**
   * @returns {ExceptionHandler}
   */
  async doGetExceptionHandler() {
    if (!this.container.has(serviceIds.EXCEPTION_HANDLER)) {
      return super.doGetExceptionHandler();
    }

    return this.container.get(serviceIds.EXCEPTION_HANDLER);
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
   * @private
   *
   * @param {SchemaCurie} curie
   *
   * @returns {{handleCommand: function}|{handleRequest: function}}
   *
   * @throws {HandlerNotFound}
   */
  async getHandler(curie) {
    try {
      return await this.container.get(curieToHandlerServiceId(curie));
    } catch (e) {
      throw new HandlerNotFound(curie);
    }
  }

  /**
   * @private
   *
   * @param {string} name
   *
   * @returns {Transport}
   */
  async getTransportForBus(name) {
    if (!this.container.hasParameter(name)) {
      return this.getDefaultTransport();
    }

    return this.container.get(`${serviceIds.TRANSPORT_PREFIX}${this.container.getParameter(name)}`);
  }
}
