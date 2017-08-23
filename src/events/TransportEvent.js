/* eslint-disable class-methods-use-this */
import PbjxEvent from './PbjxEvent';

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
