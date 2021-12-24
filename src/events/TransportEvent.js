import PbjxEvent from './PbjxEvent.js';

const transportNameSym = Symbol('transportName');

export default class TransportEvent extends PbjxEvent {
  /**
   * @param {Message} message
   * @param {string} transportName
   */
  constructor(message, transportName) {
    super(message);
    this[transportNameSym] = transportName;
  }

  /**
   * @returns {string}
   */
  getTransportName() {
    return this[transportNameSym];
  }

  /**
   * @returns {boolean}
   */
  supportsRecursion() {
    return false;
  }
}
