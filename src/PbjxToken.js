import jws from 'jws';
import crypto from 'crypto';
import InvalidArgumentException from './exceptions/InvalidArgumentException';

/**
 * The default algorithm and type of encryption scheme to use when signing.
 * Currently only HS256 (HMAC-SHA-256) is supported or allowed.
 *
 * @type {string}
 */
const DEFAULT_ALGO = 'HS256';

/**
 * The number of milliseconds in the future this token should expire.
 *
 * @type {number}
 */
const DEFAULT_EXPIRATION = 5;

/**
 * Seconds to allow time skew for time sensitive signatures
 *
 * @type {number}
 */
const DEFAULT_LEEWAY = 5;

/**
 * Used to provide claim-checking support to jws decoding and validation.
 * Currently supports: 'exp'
 *
 * @param {Object} tokenData - decoded JWT
 *
 * @throws {InvalidArgumentException}
 */
const checkClaims = (tokenData) => {
  if (!tokenData.payload.exp) {
    throw new InvalidArgumentException('The "exp" payload property is required.');
  }

  if (((Date.now() / 1000) - DEFAULT_LEEWAY) >= tokenData.payload.exp) {
    throw new InvalidArgumentException('Token expired');
  }
};

/**
 * Hash the content string, which will be included in the final token,
 * to prevent tampering with the payload.
 *
 * @param {string} content hash in base64_encoded format
 *
 * @returns {string}
 */
const createContentHash = (content) => {
  return crypto.createHmac('sha256', '')
    .update(content)
    .digest('hex');
};

export default class PbjxToken {
  /**
   * @param {string} token - A JWT formatted token
   */
  constructor(token) {
    const tokenData = jws.decode(token);
    checkClaims(tokenData);

    Object.defineProperty(this, 'token', { value: token });
    Object.defineProperty(this, 'header', { value: tokenData.header });
    Object.defineProperty(this, 'payload', { value: tokenData.payload });
    Object.defineProperty(this, 'signature', { value: tokenData.signature });

    Object.freeze(this);
  }

  /**
   * @param {string} host     - Pbjx host or service name
   * @param {string} content  - Pbjx content
   * @param {string} secret   - Shared secret
   * @param {?number} exp     - The expiry to use for the token, defaults to 5 seconds from now.
   *
   * @returns {PbjxToken}
   */
  static create(host, content, kid, secret, exp = null) {
    const header = {
      alg: DEFAULT_ALGO,
      typ: 'JWT',
      kid,
    };

    const payload = {
      host,
      pbjx: createContentHash(content),
      exp: exp || (Date.now() / 1000) + DEFAULT_EXPIRATION,
    };

    return new PbjxToken(jws.sign({ header, payload, secret }));
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.token;
  }

  /**
   * @returns {string}
   */
  toJSON() {
    return this.token;
  }

  /**
   * Get the decoded header
   *
   * @returns {Object}
   */
  getHeader() {
    return this.header;
  }

  /**
   * Get the decoded payload
   *
   * @returns {Object}
   */
  getPayload() {
    return this.payload;
  }

  /**
   * Get the signature.
   *
   * @returns {string}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * Verify the current token can be decoded given a user supplied secret.
   *
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
