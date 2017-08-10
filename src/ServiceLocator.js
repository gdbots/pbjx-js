export default class ServiceLocator {
  constructor() {
  }

  /**
   * @returns {Pbjx}
   */
  getPbjx() {
  }

  /**
   * @returns {Dispatcher}
   */
  getDispatcher() {
  }

  /**
   * @returns {CommandBus}
   */
  getCommandBus() {
  }

  /**
   * @returns {EventBus}
   */
  getEventBus() {
  }

  /**
   * @returns {RequestBus}
   */
  getRequestBus() {
  }

  /**
   * @returns {ExceptionHandler}
   */
  getExceptionHandler() {
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
  }

}
