import Event from './events/Event';

const listenersMap = Symbol('listenersMap');

export default class Dispatcher {
  constructor() {
    this[listenersMap] = new Map();
  }

  /**
   * Dispatches an event to all registered listeners.
   *
   * @param {string} eventName
   * @param {Event} event
   *
   * @returns {Event}
   */
  dispatch(eventName, event = null) {
    const theEvent = event || new Event();
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
   * @param {Event} event
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

    return Array.from(this[listenersMap].get(eventName).keys());
  }

  /**
   * Checks whether an event has any registered listeners.
   *
   * @param {string} eventName
   *
   * @returns {boolean}
   */
  hasListeners(eventName) {
    if (!this[listenersMap].has(eventName)) {
      return false;
    }

    return this[listenersMap].get(eventName).size > 0;
  }

  /**
   * Adds an event listener that listens on the specified events.
   *
   * @param {string} eventName
   * @param {function} listener
   */
  addListener(eventName, listener) {
    if (!this[listenersMap].has(eventName)) {
      this[listenersMap].set(eventName, new Map());
    }

    this[listenersMap].get(eventName).set(listener, true);
  }

  /**
   * Removes an event listener from the specified event.
   *
   * @param {string} eventName
   * @param {function} listener
   */
  removeListener(eventName, listener) {
    if (!this[listenersMap].has(eventName)) {
      return;
    }

    this[listenersMap].get(eventName).delete(listener);
  }
}
