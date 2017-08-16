const propagationStopped = Symbol('propagationStopped');

export default class Event {
  constructor() {
    this[propagationStopped] = false;
  }

  /**
   * Returns whether further event listeners should be triggered.
   *
   * @returns {boolean}
   */
  isPropagationStopped() {
    return this[propagationStopped];
  }

  /**
   * Stops the propagation of the event to further event listeners.
   *
   * If multiple event listeners are connected to the same event, no
   * further event listener will be triggered once any trigger calls
   * stopPropagation().
   */
  stopPropagation() {
    this[propagationStopped] = true;
  }
}
