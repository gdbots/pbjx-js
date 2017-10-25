import jws from 'jws';
import crypto from 'crypto';

/**
 * The default algorithm and type of encryption scheme to use when signing JWT tokens.
 * Currently only HS256 (HMAC-SHA-256) is supported or allowed.
 * @type {string}
 */
const DEFAULT_ALGO = 'HS256';

/**
 * The number of seconds in the future this token should expire.
 * @type {number}
 */
const DEFAULT_EXPIRATION = 5;

/**
 * Seconds to allow time skew for time sensitive signatures
 * @type {number}
 */
const DEFAULT_LEEWAY = 5;

export default class PbjxToken {
  /**
   * Represents a signed PBJX-JWT token.  PBJX-JWT is a type of JWS.
   * @constructor
   * @param {string} token - A JWT formatted token
   */
  constructor(token) {
    /**
     * Used to provide claim-checking support to jws decoding & validation.
     * Currently supports: 'exp'
     * @param {object} tokenData - decoded JWS object
     */
    function checkClaims(tokenData) {
      if (!tokenData.payload.exp) {
        throw new Error('No expiration tag found, this is not a valid PBJX-JWS');
      }

      if ((Date.now() - DEFAULT_LEEWAY) >= tokenData.payload.exp) {
        throw new Error('Token expired');
      }

      return true;
    }

    const tokenData = jws.decode(token);
    checkClaims(tokenData);
    Object.defineProperty(this, 'signature', { value: tokenData.signature });
    Object.defineProperty(this, 'payload', { value: tokenData.payload });
    Object.defineProperty(this, 'header', { value: tokenData.header });
    Object.defineProperty(this, 'token', { value: token });
    Object.freeze(this);
  }

  /**
   * Returns a string representation of an encoded JWT Token
   */
  toString() {
    return this.token;
  }

  /**
   * Returns a json representation of a decoded JWT Token
   */
  toJSON() {
    return this.token;
  }

  /**
   *
   * @param {string} host - Pbjx host or service name
   * @param {string} content - Pbjx content
   * @param {string} secret - Shared secret
   * @returns {PbjxToken}
   */
  static create(host, content, secret) {
    function getPayloadHash() {
      return crypto.createHmac('sha256', secret)
        .update(content)
        .digest('base64');
    }

    const header = {
      alg: DEFAULT_ALGO,
      typ: 'JWT',
    };
    const payload = {
      host,
      pbjx: getPayloadHash(),
      exp: Date.now() + DEFAULT_EXPIRATION,
    };
    const token = jws.sign({
      header,
      payload,
      secret,
    });
    return new PbjxToken(token);
  }

  /**
   * Get the decoded header
   * @returns {string}
   */
  getHeader() {
    return this.header;
  }

  /**
   * Get the decoded payload
   * @returns {mixed}
   */
  getPayload() {
    return this.payload;
  }

  /**
   * Get the signature in base64 format
   * @returns {string}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * Verify the current token can be decoded given a user supplied secret.
   * @returns {boolean}
   */
  verify(secret) {
    try {
      return jws.verify(this.token, DEFAULT_ALGO, secret);
    } catch (ex) {
      return false;
    }
  }
}
