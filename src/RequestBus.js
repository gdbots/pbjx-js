import createResponseForFailedRequest from './utils/createResponseForFailedRequest.js';

export default class RequestBus {
  /**
   * @param {ServiceLocator} locator
   * @param {Transport} transport
   */
  constructor(locator, transport) {
    Object.defineProperty(this, 'locator', { value: locator });
    Object.defineProperty(this, 'transport', { value: transport });
  }

  /**
   * Processes a request and returns the response from the handler.
   *
   * @param {Message} req - Expected to be a message using mixin 'gdbots:pbjx:mixin:request'
   *
   * @returns {Promise.<Message>} Resolves with a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async request(req) {
    return this.transport.sendRequest(req.freeze());
  }

  /**
   * Invokes the handler that services the given request.  If an exception occurs
   * it will be caught and a RequestFailedResponse will be created with the reason.
   *
   * @internal
   * @package
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise.<Message>} Resolves with a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async receiveRequest(request) {
    try {
      const handler = await this.locator.getRequestHandler(request.schema().getCurie());
      request.freeze();
      const pbjx = await this.locator.getPbjx();
      const response = await handler.handleRequest(request, pbjx);
      response.set('ctx_request_ref', request.generateMessageRef());
      if (request.has('ctx_correlator_ref')) {
        response.set('ctx_correlator_ref', request.get('ctx_correlator_ref'));
      }

      if (request.has('ctx_tenant_id')) {
        response.set('ctx_tenant_id', request.get('ctx_tenant_id'));
      }

      return response;
    } catch (e) {
      return createResponseForFailedRequest(request, e);
    }
  }
}
