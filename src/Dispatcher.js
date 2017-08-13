import PbjxEvent from './events/PbjxEvent';

const privateProps = new WeakMap();

export default class Dispatcher {
  constructor() {
    privateProps.set(this, { listeners: new Map() });
  }

  /**
   * Dispatches an event to all registered listeners.
   *
   * @param {string} eventName
   * @param {PbjxEvent} event
   *
   * @returns {PbjxEvent}
   */
  dispatch(eventName, event = null) {
    const theEvent = event || new PbjxEvent();
    const listeners = this.getListeners(eventName);
    this.doDispatch(listeners, eventName, theEvent);
    return theEvent;
  }

  /**
   * Triggers the listeners of an event.
   *
   * This method can be overridden to add functionality
   * that is executed for each listener.
   *
   * @protected
   *
   * @param {function[]} listeners
   * @param {string} eventName
   * @param {PbjxEvent} event
   */
  doDispatch(listeners, eventName, event) {
    const l = listeners.length;
    for (let i = 0; i < l; i += 1) {
      if (event.isPropagationStopped()) {
        break;
      }

      listeners[i](event, eventName, this);
    }
  }

  /**
   * Gets the listeners of a specific event.
   *
   * @param {string} eventName
   *
   * @returns {function[]}
   */
  getListeners(eventName) {
    if (!this.hasListeners(eventName)) {
      return [];
    }

    return Array.from(privateProps.get(this).listeners.get(eventName).keys());
  }

  /**
   * Checks whether an event has any registered listeners.
   *
   * @param {string} eventName
   *
   * @returns {boolean}
   */
  hasListeners(eventName) {
    const dispatcher = privateProps.get(this);
    if (!dispatcher.listeners.has(eventName)) {
      return false;
    }

    return dispatcher.listeners.get(eventName).size > 0;
  }

  /**
   * Adds an event listener that listens on the specified events.
   *
   * @param {string} eventName
   * @param {function} listener
   */
  addListener(eventName, listener) {
    const dispatcher = privateProps.get(this);
    if (!dispatcher.listeners.has(eventName)) {
      dispatcher.listeners.set(eventName, new Map());
    }

    dispatcher.listeners.get(eventName).set(listener, true);
  }

  /**
   * Removes an event listener from the specified event.
   *
   * @param {string} eventName
   * @param {function} listener
   */
  removeListener(eventName, listener) {
    const dispatcher = privateProps.get(this);
    if (!dispatcher.listeners.has(eventName)) {
      return;
    }

    dispatcher.listeners.get(eventName).delete(listener);
  }
}
