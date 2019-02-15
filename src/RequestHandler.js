/* eslint-disable no-unused-vars */
import LogicException from './exceptions/LogicException';

/**
 * Extend this class on all of your request handlers.
 * Currently this serves as a marker/tag interface.
 */
export default class RequestHandler {
  /**
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   * @param {Pbjx}    pbjx    - The Pbjx instance handling the request.
   *
   * @returns {Promise.<Message>} Resolves with a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async handleRequest(request, pbjx) {
    throw new LogicException(`Method "handleRequest" must be implemented on the handler for "${request.schema().getCurie()}.`);
  }
}
