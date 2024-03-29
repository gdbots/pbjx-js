import AssertionFailed from '@gdbots/pbj/exceptions/AssertionFailed.js';
import JsonSerializer from '@gdbots/pbj/serializers/JsonSerializer.js';

const serializers = new Map();

export default class TransportEnvelope {
  /**
   * @param {Message} message
   * @param {string} serializer
   */
  constructor(message, serializer) {
    Object.defineProperty(this, 'message', { value: message });
    Object.defineProperty(this, 'serializer', { value: serializer });
  }

  /**
   * @param {string} serializer
   *
   * @returns {JsonSerializer}
   */
  static getSerializer(serializer) {
    if (!serializers.has(serializer)) {
      serializers.set(serializer, JsonSerializer);
    }

    return serializers.get(serializer);
  }

  /**
   * Recreates the envelope from a json string.
   *
   * @param {string} json
   *
   * @returns {TransportEnvelope}
   *
   * @throws {AssertionFailed}
   */
  static async fromJSON(json) {
    let obj;

    try {
      obj = JSON.parse(json);
    } catch (e) {
      throw new AssertionFailed('Invalid JSON.');
    }

    if (!obj.message || !obj.serializer) {
      throw new AssertionFailed('Invalid TransportEnvelope object.');
    }

    const serializer = obj.serializer || 'json';
    const isReplay = !!obj.is_replay;
    const srlzr = TransportEnvelope.getSerializer(serializer);
    const message = await srlzr.deserialize(obj.message || '');

    if (isReplay) {
      message.isReplay(true);
    }

    return new TransportEnvelope(message, serializer);
  }

  /**
   * @returns {Object}
   */
  toObject() {
    return {
      serializer: this.serializer,
      is_replay: this.message.isReplay(),
      message: TransportEnvelope.getSerializer(this.serializer).serialize(this.message),
    };
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * Returns a json string version of the envelope.
   *
   * @returns {string}
   */
  toString() {
    return JSON.stringify(this);
  }

  /**
   * @returns {Message}
   */
  getMessage() {
    return this.message;
  }

  /**
   * @returns {boolean}
   */
  isReplay() {
    return this.message.isReplay();
  }

  /**
   * @returns {string}
   */
  getSerializerUsed() {
    return this.serializer;
  }
}
