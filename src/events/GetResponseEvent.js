/* eslint-disable class-methods-use-this */
import LogicException from '../exceptions/LogicException';
import PbjxEvent from './PbjxEvent';

const responseSym = Symbol('response');

export default class GetResponseEvent extends PbjxEvent {
  /**
   * @param {Message} request
   */
  constructor(request) {
    super(request);
    this[responseSym] = null;
  }

  /**
   * @returns {Message}
   */
  getRequest() {
    return this.getMessage();
  }

  /**
   * @returns {boolean}
   */
  hasResponse() {
    return this[responseSym] !== null;
  }

  /**
   * @returns {Message}
   */
  getResponse() {
    return this[responseSym];
  }

  /**
   * @param {Message} response
   *
   * @throws {LogicException}
   */
  setResponse(response) {
    if (this.hasResponse()) {
      throw new LogicException('Response can only be set one time.');
    }

    const request = this.getRequest();

    if (!response.has('ctx_request')) {
      response.set('ctx_request', request);
    }

    if (!response.has('ctx_request_ref')) {
      response.set('ctx_request_ref', request.generateMessageRef());
    }

    if (!response.has('ctx_correlator_ref') && request.has('ctx_correlator_ref')) {
      response.set('ctx_correlator_ref', request.get('ctx_correlator_ref'));
    }

    this[responseSym] = response;
    this.stopPropagation();
  }

  /**
   * @returns {boolean}
   */
  supportsRecursion() {
    return false;
  }
}