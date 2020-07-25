import CommandBus from './CommandBus';
import Dispatcher from './Dispatcher';
import EventBus from './EventBus';
import ExceptionHandler from './ExceptionHandler';
import HandlerNotFound from './exceptions/HandlerNotFound';
import InMemoryTransport from './transports/InMemoryTransport';
import Pbjx from './Pbjx';
import RequestBus from './RequestBus';

const pbjx = Symbol('pbjx');
const dispatcher = Symbol('dispatcher');
const commandBus = Symbol('commandBus');
const eventBus = Symbol('eventBus');
const requestBus = Symbol('requestBus');
const exceptionHandler = Symbol('exceptionHandler');
const defaultTransport = Symbol('defaultTransport');

/**
 * This class is meant to be extended so location of all services works as expected.
 *
 * @see ContainerAwareServiceLocator - used for most apps
 * @see RegisteringServiceLocator    - typically used for unit testing
 *
 * @link https://martinfowler.com/articles/injection.html#UsingAServiceLocator
 */
export default class ServiceLocator {
  constructor() {
    this[pbjx] = null;
    this[dispatcher] = null;
    this[commandBus] = null;
    this[eventBus] = null;
    this[requestBus] = null;
    this[exceptionHandler] = null;
    this[defaultTransport] = null;
  }

  /**
   * @returns {Pbjx}
   */
  async getPbjx() {
    if (this[pbjx] === null) {
      this[pbjx] = await this.doGetPbjx();
    }

    return this[pbjx];
  }

  /**
   * @package
   *
   * @returns {Pbjx}
   */
  async doGetPbjx() {
    return new Pbjx(this);
  }

  /**
   * @returns {Dispatcher}
   */
  async getDispatcher() {
    if (this[dispatcher] === null) {
      this[dispatcher] = await this.doGetDispatcher();
    }

    return this[dispatcher];
  }

  /**
   * @package
   *
   * @returns {Dispatcher}
   */
  async doGetDispatcher() {
    return new Dispatcher();
  }

  /**
   * @returns {CommandBus}
   */
  async getCommandBus() {
    if (this[commandBus] === null) {
      this[commandBus] = await this.doGetCommandBus();
    }

    return this[commandBus];
  }

  /**
   * @package
   *
   * @returns {CommandBus}
   */
  async doGetCommandBus() {
    return new CommandBus(this, await this.getDefaultTransport());
  }

  /**
   * @returns {EventBus}
   */
  async getEventBus() {
    if (this[eventBus] === null) {
      this[eventBus] = await this.doGetEventBus();
    }

    return this[eventBus];
  }

  /**
   * @package
   *
   * @returns {EventBus}
   */
  async doGetEventBus() {
    return new EventBus(this, await this.getDefaultTransport());
  }

  /**
   * @returns {RequestBus}
   */
  async getRequestBus() {
    if (this[requestBus] === null) {
      this[requestBus] = await this.doGetRequestBus();
    }

    return this[requestBus];
  }

  /**
   * @package
   *
   * @returns {RequestBus}
   */
  async doGetRequestBus() {
    return new RequestBus(this, await this.getDefaultTransport());
  }

  /**
   * @returns {ExceptionHandler}
   */
  async getExceptionHandler() {
    if (this[exceptionHandler] === null) {
      this[exceptionHandler] = await this.doGetExceptionHandler();
    }

    return this[exceptionHandler];
  }

  /**
   * @package
   *
   * @returns {ExceptionHandler}
   */
  async doGetExceptionHandler() {
    return new ExceptionHandler(await this.getDispatcher());
  }

  /**
   * Returns the handler for the provided command.
   *
   * @param {SchemaCurie} curie
   *
   * @returns {{handleCommand: function}}
   *
   * @throws {HandlerNotFound}
   */
  async getCommandHandler(curie) {
    throw new HandlerNotFound(curie);
  }

  /**
   * Returns the handler for the provided request.
   *
   * @param {SchemaCurie} curie
   *
   * @returns {{handleRequest: function}}
   *
   * @throws {HandlerNotFound}
   */
  async getRequestHandler(curie) {
    throw new HandlerNotFound(curie);
  }

  /**
   * @package
   *
   * @returns {Transport}
   */
  async getDefaultTransport() {
    if (this[defaultTransport] === null) {
      this[defaultTransport] = await this.doGetDefaultTransport();
    }

    return this[defaultTransport];
  }

  /**
   * @param {Transport} transport
   */
  setDefaultTransport(transport) {
    this[defaultTransport] = transport;
  }

  /**
   * @package
   *
   * @returns {Transport}
   */
  async doGetDefaultTransport() {
    return new InMemoryTransport(this);
  }
}
