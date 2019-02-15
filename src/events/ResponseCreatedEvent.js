import PbjxEvent from './PbjxEvent';

const responseSym = Symbol('response');

export default class ResponseCreatedEvent extends PbjxEvent {
  /**
   * @param {Message} request
   * @param {Message} response
   */
  constructor(request, response) {
    super(request);
    this[responseSym] = response;
  }

  /**
   * @returns {Message}
   */
  getRequest() {
    return this.getMessage();
  }

  /**
   * @returns {Message}
   */
  getResponse() {
    return this[responseSym];
  }

  /**
   * @returns {boolean}
   */
  supportsRecursion() {
    return false;
  }
}
