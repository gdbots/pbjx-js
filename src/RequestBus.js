import createResponseForFailedRequest from './utils/createResponseForFailedRequest';

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
   * @returns {Promise.<Message>} Expected to be a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async request(req) {
    return this.transport.sendRequest(req.freeze());
  }

  /**
   * Processes an request directly.  DO NOT use this method in the application as this
   * is intended for the transports, consumers and workers of the Pbjx system.
   *
   * Invokes the handler that services the given request.  If an exception occurs
   * it will be caught and a RequestFailedResponse will be created with the reason.
   *
   * @internal
   * @package
   *
   * @param {Message} request - Expected to be a message using mixin 'gdbots:pbjx:mixin:event'
   *
   * @returns {Promise.<Message>} Expected to be a message using mixin 'gdbots:pbjx:mixin:response'
   */
  async receiveRequest(request) {
    let handler;

    try {
      handler = this.locator.getRequestHandler(request.schema().getCurie());
    } catch (e) {
      return createResponseForFailedRequest(request, e);
    }

    try {
      request.freeze();
      const response = await handler.handleRequest(request, this.locator.getPbjx());
      response.set('ctx_request_ref', request.generateMessageRef());
      if (request.has('ctx_correlator_ref')) {
        response.set('ctx_correlator_ref', request.get('ctx_correlator_ref'));
      }

      return response;
    } catch (e) {
      return createResponseForFailedRequest(request, e);
    }
  }
}
