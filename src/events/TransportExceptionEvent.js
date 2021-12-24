import TransportEvent from './TransportEvent.js';

const exceptionSym = Symbol('exception');

export default class TransportExceptionEvent extends TransportEvent {
  /**
   * @param {Message} message
   * @param {string} transportName
   * @param {Exception} exception
   */
  constructor(message, transportName, exception) {
    super(message, transportName);
    this[exceptionSym] = exception;
  }

  /**
   * @returns {Exception}
   */
  getException() {
    return this[exceptionSym];
  }
}
