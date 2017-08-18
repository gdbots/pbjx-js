/* eslint-disable class-methods-use-this */
import PbjxEvent from './PbjxEvent';

const envelopeSym = Symbol('envelope');

export default class EnvelopeReceivedEvent extends PbjxEvent {
  /**
   * @param {Message} message
   * @param {Message} envelope
   */
  constructor(message, envelope) {
    super(message);
    this[envelopeSym] = envelope;
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
  supportsRecursion() {
    return false;
  }
}
