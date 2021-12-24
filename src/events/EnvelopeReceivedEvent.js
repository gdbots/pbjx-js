import PbjxEvent from './PbjxEvent.js';

const envelopeSym = Symbol('envelope');
const fetchResponseSym = Symbol('fetchResponse');

export default class EnvelopeReceivedEvent extends PbjxEvent {
  /**
   * @param {Message}   message       - The original pbj message that initiated the HTTP operation.
   * @param {Message}   envelope      - The pbj envelope returned from the server.
   * @param {?Response} fetchResponse - The response from the HTTP fetch operation
   */
  constructor(message, envelope, fetchResponse = null) {
    super(message);
    this[envelopeSym] = envelope;
    this[fetchResponseSym] = fetchResponse;
  }

  /**
   * @returns {Message}
   */
  getEnvelope() {
    return this[envelopeSym];
  }

  /**
   * @returns {boolean}
   */
  hasFetchResponse() {
    return this[fetchResponseSym] !== null;
  }

  /**
   * @returns {?Response}
   */
  getFetchResponse() {
    return this[fetchResponseSym];
  }

  /**
   * @returns {boolean}
   */
  supportsRecursion() {
    return false;
  }
}
