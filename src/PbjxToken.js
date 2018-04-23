import crypto from 'crypto';
import jws from 'jws';
import InvalidArgumentException from './exceptions/InvalidArgumentException';

/**
 * The algorithm and type of encryption scheme to use when signing.
 * Currently only HS256 (HMAC-SHA-256) is supported or allowed.
 *
 * @type {string}
 */
const ALGO = 'HS256';

/**
 * The ttl (time to live), in seconds, for a token.
 * Used to create the "exp" claim.
 *
 * @type {number}
 */
const TTL = 10;

/**
 * Seconds to allow time skew for time sensitive signatures
 *
 * @type {number}
 */
const LEEWAY = 300;

/**
 * Ensures the token structure matches our expectations.
 *
 * @param {Object} decodedToken - decoded JWT
 *
 * @throws {InvalidArgumentException}
 */
const checkClaims = (decodedToken) => {
  if (!decodedToken.header || !decodedToken.payload || !decodedToken.signature) {
    throw new InvalidArgumentException('Missing header, payload or signature.');
  }

  if (!decodedToken.header.kid) {
    throw new InvalidArgumentException('The "kid" header property is required.');
  }

  if (!decodedToken.payload.aud
    || !decodedToken.payload.exp
    || !decodedToken.payload.iat
    || !decodedToken.payload.jti
  ) {
    throw new InvalidArgumentException('The payload properties [aud,exp,iat,jti] are required.');
  }

  const now = Math.floor(Date.now() / 1000);

  if (decodedToken.payload.iat > (now + LEEWAY)) {
    throw new InvalidArgumentException('Cannot handle token prior to iat.');
  }

  if ((now - LEEWAY) >= decodedToken.payload.exp) {
    throw new InvalidArgumentException('Token expired');
  }
};

export default class PbjxToken {
  /**
   * @param {string} token - A JWT formatted token
   */
  constructor(token) {
    const decodedToken = jws.decode(token);
    checkClaims(decodedToken);

    Object.defineProperty(this, 'token', { value: token });
    Object.defineProperty(this, 'header', { value: decodedToken.header });
    Object.defineProperty(this, 'payload', { value: decodedToken.payload });
    Object.defineProperty(this, 'signature', { value: decodedToken.signature });

    Object.freeze(this);
  }

  /**
   * PbjxTokens are JWT so the arguments are used to create the payload
   * of the JWT with our own requirements/conventions.
   *
   * @param {string} content - Pbjx content (combined with aud and iat then hashed to create a jti)
   * @param {string} aud     - Pbjx endpoint this token will be sent to.
   * @param {string} kid     - Key ID used to sign the JWT.
   * @param {string} secret  - Secret used to sign the JWT.
   * @param {Object} options - Additional options for JWT creation (exp,iat)
   *
   * @returns {PbjxToken}
   */
  static create(content, aud, kid, secret, options = { exp: null, iat: null }) {
    const header = {
      alg: ALGO,
      typ: 'JWT',
      kid,
    };

    const now = Math.floor(Date.now() / 1000);
    const iat = options.iat || now;

    const payload = {
      aud,
      exp: options.exp || now + TTL,
      iat,
      jti: crypto.createHmac('sha256', secret).update(`${aud}${iat}${content}`).digest('hex'),
    };

    return new PbjxToken(jws.sign({ header, payload, secret }));
  }

  /**
   * @param {string} token
   *
   * @returns {PbjxToken}
   */
  static fromString(token) {
    return new PbjxToken(token);
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
   * @returns {Object}
   */
  getHeader() {
    return this.header;
  }

  /**
   * @returns {Object}
   */
  getPayload() {
    return this.payload;
  }

  /**
   * @returns {string}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * @returns {string}
   */
  getKid() {
    return this.getHeader().kid;
  }

  /**
   * @link https://tools.ietf.org/html/rfc7519#section-4.1.3
   *
   * @returns {string}
   */
  getAud() {
    return this.getPayload().aud;
  }

  /**
   * @link https://tools.ietf.org/html/rfc7519#section-4.1.4
   *
   * @returns {number} a unix timestamp in seconds
   */
  getExp() {
    return this.getPayload().exp;
  }

  /**
   * @link https://tools.ietf.org/html/rfc7519#section-4.1.6
   *
   * @returns {number} a unix timestamp in seconds
   */
  getIat() {
    return this.getPayload().iat;
  }

  /**
   * @link https://tools.ietf.org/html/rfc7519#section-4.1.7
   *
   * @returns {string}
   */
  getJti() {
    return this.getPayload().jti;
  }

  /**
   * Verify the current token can be decoded given a user supplied secret.
   *
   * @returns {boolean}
   */
  verify(secret) {
    try {
      return jws.verify(this.token, ALGO, secret);
    } catch (ex) {
      return false;
    }
  }
}
