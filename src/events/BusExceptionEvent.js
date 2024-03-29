import PbjxEvent from './PbjxEvent.js';

const exceptionSym = Symbol('exception');

export default class BusExceptionEvent extends PbjxEvent {
  /**
   * @param {Message} message
   * @param {Exception} exception
   */
  constructor(message, exception) {
    super(message);
    this[exceptionSym] = exception;
  }

  /**
   * @returns {Exception}
   */
  getException() {
    return this[exceptionSym];
  }

  /**
   * @returns {boolean}
   */
  supportsRecursion() {
    return false;
  }
}
