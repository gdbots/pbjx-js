import Exception from '@gdbots/common/Exception';
import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code';
import RequestFailedResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/RequestFailedResponseV1';

/**
 * @param {Message}         request   - A message using mixin 'gdbots:pbjx:mixin:request'
 * @param {Error|Exception} exception - The Exception that caused the failure.
 *
 * @returns {Message} Returns a message using mixin 'gdbots:pbjx:mixin:response'
 */
export default function createResponseForFailedRequest(request, exception) {
  let code = Code.UNKNOWN.getValue();
  if (exception instanceof Exception) {
    code = exception.getCode() || code;
  }

  const response = RequestFailedResponseV1.create()
    .set('ctx_request_ref', request.generateMessageRef())
    .set('ctx_request', request)
    .set('error_code', code)
    .set('error_name', exception.name)
    .set('error_message', exception.message.substr(0, 2048))
    .set('stack_trace', exception.stack || null);

  if (request.has('ctx_correlator_ref')) {
    response.set('ctx_correlator_ref', request.get('ctx_correlator_ref'));
  }

  return response;
}
