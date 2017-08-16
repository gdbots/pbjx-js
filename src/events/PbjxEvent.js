/* eslint-disable class-methods-use-this */
import Event from './Event';
import LogicException from '../exceptions/LogicException';

const pbjxService = Symbol('pbjxService');
const reduxStore = Symbol('reduxStore');
const depth = Symbol('depth');
const parentEvent = Symbol('parentEvent');
const pbjMessage = Symbol('pbjMessage');

export default class PbjxEvent extends Event {
  /**
   * @param {Message} message
   */
  constructor(message) {
    super();
    this[depth] = 0;
    this[parentEvent] = null;
    this[pbjMessage] = message;
  }

  /**
   * @returns {Message}
   */
  getMessage() {
    return this[pbjMessage];
  }

  /**
   * @returns {number}
   */
  getDepth() {
    return this[depth];
  }

  /**
   * @returns {boolean}
   */
  hasParentEvent() {
    return this[parentEvent] !== null;
  }

  /**
   * @returns {PbjxEvent}
   */
  getParentEvent() {
    return this[parentEvent];
  }

  /**
   * @returns {boolean}
   */
  isRootEvent() {
    return this[depth] === 0;
  }

  /**
   * @param {Message} message
   *
   * @returns {PbjxEvent}
   */
  createChildEvent(message) {
    if (!this.supportsRecursion()) {
      throw new LogicException(`${this.constructor.name} does not support recursion.`);
    }

    const event = new (this.constructor)(message);
    event[depth] = this.getDepth() + 1;
    event[parentEvent] = this;
    return event;
  }

  /**
   * @returns {boolean}
   */
  supportsRecursion() {
    return true;
  }

  /**
   * @returns {Pbjx}
   */
  getPbjx() {
    return PbjxEvent[pbjxService];
  }

  /**
   * @returns {{getState: function, dispatch: function, subscribe: function}}
   */
  getRedux() {
    return PbjxEvent[reduxStore];
  }

  /**
   * @param {Pbjx} pbjx
   */
  static setPbjx(pbjx) {
    PbjxEvent[pbjxService] = pbjx;
  }

  /**
   * @param {{getState: function, dispatch: function, subscribe: function}} redux
   */
  static setRedux(redux) {
    PbjxEvent[reduxStore] = redux;
  }
}

PbjxEvent[pbjxService] = null;
PbjxEvent[reduxStore] = null;
