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
  getPbjx() {
    if (this[pbjx] === null) {
      this[pbjx] = this.doGetPbjx();
    }

    return this[pbjx];
  }

  /**
   * @package
   *
   * @returns {Pbjx}
   */
  doGetPbjx() {
    return new Pbjx(this);
  }

  /**
   * @returns {Dispatcher}
   */
  getDispatcher() {
    if (this[dispatcher] === null) {
      this[dispatcher] = this.doGetDispatcher();
    }

    return this[dispatcher];
  }

  /**
   * @package
   *
   * @returns {Dispatcher}
   */
  doGetDispatcher() {
    return new Dispatcher();
  }

  /**
   * @returns {CommandBus}
   */
  getCommandBus() {
    if (this[commandBus] === null) {
      this[commandBus] = this.doGetCommandBus();
    }

    return this[commandBus];
  }

  /**
   * @package
   *
   * @returns {CommandBus}
   */
  doGetCommandBus() {
    return new CommandBus(this, this.getDefaultTransport());
  }

  /**
   * @returns {EventBus}
   */
  getEventBus() {
    if (this[eventBus] === null) {
      this[eventBus] = this.doGetEventBus();
    }

    return this[eventBus];
  }

  /**
   * @package
   *
   * @returns {EventBus}
   */
  doGetEventBus() {
    return new EventBus(this, this.getDefaultTransport());
  }

  /**
   * @returns {RequestBus}
   */
  getRequestBus() {
    if (this[requestBus] === null) {
      this[requestBus] = this.doGetRequestBus();
    }

    return this[requestBus];
  }

  /**
   * @package
   *
   * @returns {RequestBus}
   */
  doGetRequestBus() {
    return new RequestBus(this, this.getDefaultTransport());
  }

  /**
   * @returns {ExceptionHandler}
   */
  getExceptionHandler() {
    if (this[exceptionHandler] === null) {
      this[exceptionHandler] = this.doGetExceptionHandler();
    }

    return this[exceptionHandler];
  }

  /**
   * @package
   *
   * @returns {ExceptionHandler}
   */
  doGetExceptionHandler() {
    return new ExceptionHandler(this.getDispatcher());
  }

  /**
   * Returns the handler for the provided command.
   *
   * @param {SchemaCurie} curie
   *
   * @returns {CommandHandler}
   *
   * @throws {HandlerNotFound}
   */
  getCommandHandler(curie) {
    throw new HandlerNotFound(curie);
  }

  /**
   * Returns the handler for the provided request.
   *
   * @param {SchemaCurie} curie
   *
   * @returns {RequestHandler}
   *
   * @throws {HandlerNotFound}
   */
  getRequestHandler(curie) {
    throw new HandlerNotFound(curie);
  }

  /**
   * @package
   *
   * @returns {Transport}
   */
  getDefaultTransport() {
    if (this[defaultTransport] === null) {
      this[defaultTransport] = this.doGetDefaultTransport();
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
  doGetDefaultTransport() {
    return new InMemoryTransport(this);
  }
}
