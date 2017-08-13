const privateProps = new WeakMap();

export default class PbjxEvent {
  constructor() {
    privateProps.set(this, {
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
    return privateProps.get(this).propagationStopped;
  }

  /**
   * Stops the propagation of the event to further event listeners.
   *
   * If multiple event listeners are connected to the same event, no
   * further event listener will be triggered once any trigger calls
   * stopPropagation().
   */
  stopPropagation() {
    privateProps.get(this).propagationStopped = true;
  }
}
