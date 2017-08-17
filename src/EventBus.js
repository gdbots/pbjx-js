export default class EventBus {
  /**
   * @param {ServiceLocator} locator
   * @param {Transport} transport
   */
  constructor(locator, transport) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transport', { value: transport });
  }

  /**
   * Publishes events to all subscribers.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @throws {GdbotsPbjxException}
   * @throws {Exception}
   */
  async publish(event) {
    // return this.transport.sendEvent(event.freeze());
    return this.locator.getDispatcher().getListeners(event.schema().getCurie().toString()).map(l => l(event, this));
  }

  /**
   * Processes an event directly.  DO NOT use this method in the application as this
   * is intended for the transports, consumers and workers of the Pbjx system.
   *
   * Publishes the event to all subscribers using the dispatcher, which processes
   * events in memory.  If any events throw an exception an EventExecutionFailed
   * event will be published.
   *
   * @internal
   * @package
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   */
  receiveEvent(event) {
  }
}
