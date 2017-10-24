import AssertionFailed from '@gdbots/pbj/exceptions/AssertionFailed';
import JsonSerializer from '@gdbots/pbj/serializers/JsonSerializer';

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
  static fromJSON(json) {
    let obj;

    try {
      obj = JSON.parse(json);
    } catch (e) {
      throw new AssertionFailed('Invalid JSON.');
    }

    const serializer = obj.serializer ? obj.serializer : 'json';
    const message = TransportEnvelope.getSerializer(serializer).deserialize(obj.message ? obj.message : '');

    return new this(message, serializer);
  }

  /**
   * @param {string} json
   *
   * @returns {Object}
   */
  static toObject(json) {
    let obj;

    try {
      obj = JSON.parse(json);
    } catch (e) {
      throw new AssertionFailed('Invalid JSON.');
    }

    return obj;
  }

  /**
   * Returns a json string version of the envelope.
   *
   * @return string
   */
  toString() {
    return JSON.stringify({
      serializer: this.serializer,
      is_replay: this.message.isReplay(),
      message: TransportEnvelope.getSerializer(this.serializer).serialize(this.message),
    });
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
