/* eslint-disable class-methods-use-this */
import CommandBus from './CommandBus';
import Dispatcher from './Dispatcher';
import EventBus from './EventBus';
import ExceptionHandler from './ExceptionHandler';
import HandlerNotFound from './exceptions/HandlerNotFound';
import InMemoryTransport from './transports/InMemoryTransport';
import Pbjx from './Pbjx';
import RequestBus from './RequestBus';

const privateProps = new WeakMap();

export default class ServiceLocator {
  constructor() {
    privateProps.set(this, {
      pbjx: null,
      dispatcher: null,
      commandBus: null,
      eventBus: null,
      requestBus: null,
      exceptionHandler: null,
      defaultTransport: null,
    });
  }

  /**
   * @returns {Pbjx}
   */
  getPbjx() {
    const locator = privateProps.get(this);
    if (locator.pbjx === null) {
      locator.pbjx = this.doGetPbjx();
    }

    return locator.pbjx;
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
    const locator = privateProps.get(this);
    if (locator.dispatcher === null) {
      locator.dispatcher = this.doGetDispatcher();
    }

    return locator.dispatcher;
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
    const locator = privateProps.get(this);
    if (locator.commandBus === null) {
      locator.commandBus = this.doGetCommandBus();
    }

    return locator.commandBus;
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
    const locator = privateProps.get(this);
    if (locator.eventBus === null) {
      locator.eventBus = this.doGetEventBus();
    }

    return locator.eventBus;
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
    const locator = privateProps.get(this);
    if (locator.requestBus === null) {
      locator.requestBus = this.doGetRequestBus();
    }

    return locator.requestBus;
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
    const locator = privateProps.get(this);
    if (locator.exceptionHandler === null) {
      locator.exceptionHandler = this.doGetExceptionHandler();
    }

    return locator.exceptionHandler;
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
    const locator = privateProps.get(this);
    if (locator.defaultTransport === null) {
      locator.defaultTransport = this.doGetDefaultTransport();
    }

    return locator.defaultTransport;
  }

  /**
   * @param {Transport} transport
   */
  setDefaultTransport(transport) {
    const locator = privateProps.get(this);
    locator.defaultTransport = transport;
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
