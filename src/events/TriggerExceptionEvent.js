import PbjxEvent from './PbjxEvent.js';

const eventNameSym = Symbol('eventName');
const exceptionSym = Symbol('exception');

export default class TriggerExceptionEvent extends PbjxEvent {
  /**
   * @param {Message} message
   * @param {string} eventName
   * @param {Exception|Error} exception
   */
  constructor(message, eventName, exception) {
    super(message);
    this[eventNameSym] = eventName;
    this[exceptionSym] = exception;
  }

  /**
   * @returns {string}
   */
  getEventName() {
    return this[eventNameSym];
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
