/**
 * Stores all events instances so some data is
 * kept private and cannot be mutated directly.
 *
 * type {WeakMap}
 */
const events = new WeakMap();

export default class PbjxEvent {
  constructor() {
    events.set(this, {
      /** @var {boolean} */
      propagationStopped: false,
    });
  }

  /**
   * Returns whether further event listeners should be triggered.
   *
   * @returns {boolean}
   */
  isPropagationStopped() {
    return events.get(this).propagationStopped;
  }

  /**
   * Stops the propagation of the event to further event listeners.
   *
   * If multiple event listeners are connected to the same event, no
   * further event listener will be triggered once any trigger calls
   * stopPropagation().
   */
  stopPropagation() {
    events.get(this).propagationStopped = true;
  }
}
