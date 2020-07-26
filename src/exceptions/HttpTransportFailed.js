import GdbotsPbjxException from './GdbotsPbjxException';

export default class HttpTransportFailed extends GdbotsPbjxException {
  /**
   * @param {Message}   pbj      - The original pbj message that initiated the HTTP operation.
   * @param {Message}   envelope - The pbj envelope returned from the server.
   */
  constructor(pbj, envelope) {
    const code = envelope.get('code', 2);
    const errName = envelope.get('error_name');
    const errMessage = envelope.get('error_message');
    super(`HttpTransport failed to handle [${pbj.generateMessageRef()}]. ${errName}::${code}::${errMessage}`, code);
    this.pbj = pbj;
    this.envelope = envelope;
  }

  /**
   * @returns {Message}
   */
  getPbj() {
    return this.pbj;
  }

  /**
   * @returns {Message}
   */
  getEnvelope() {
    return this.envelope;
  }
}
