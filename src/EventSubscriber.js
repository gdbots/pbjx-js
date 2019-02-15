import upperFirst from 'lodash/upperFirst';

export default class EventSubscriber {
  /**
   * Convenience method that will automatically call a method whose
   * name is "on{CamelizedMessageName}".  This is typically used when
   * registering listeners/subscribers for events with wildcards.
   *
   * @param {Message} event - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   * @param {Pbjx}    pbjx
   *
   * @returns {Promise}
   */
  async onEvent(event, pbjx) {
    const method = `on${upperFirst(event.schema().getHandlerMethodName(false))}`;
    if (this[method]) {
      await this[method](event, pbjx);
    }
  }

  /**
   * @param {Message[]} events - An array of messages using mixin 'gdbots:pbjx:mixin:event'
   * @param {Pbjx}      pbjx
   */
  onEvents(events, pbjx) {
    events.forEach(event => this.onEvent(event, pbjx));
  }

  /**
   * Returns an object of event names this subscriber wants to listen to.
   * The keys are the event name and the value is the function to call.
   *
   * @returns {Object}
   */
  getSubscribedEvents() {
    return {};
  }
}
