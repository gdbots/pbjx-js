import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code';
import HttpCode from '@gdbots/schemas/gdbots/pbjx/enums/HttpCode';

/**
 * Convert our "Code" aka vendor code to an http status code.
 *
 * @param {number} code
 *
 * @returns {number}
 */
export function vendorToHttp(code = Code.OK.getValue()) {
  if (Code.OK.getValue() === code) {
    return HttpCode.HTTP_OK.getValue();
  }

  switch (code) {
    case Code.CANCELLED.getValue():
      return HttpCode.HTTP_CLIENT_CLOSED_REQUEST.getValue();

    case Code.UNKNOWN.getValue():
      return HttpCode.HTTP_INTERNAL_SERVER_ERROR.getValue();

    case Code.INVALID_ARGUMENT.getValue():
      return HttpCode.HTTP_BAD_REQUEST.getValue();

    case Code.DEADLINE_EXCEEDED.getValue():
      return HttpCode.HTTP_GATEWAY_TIMEOUT.getValue();

    case Code.NOT_FOUND.getValue():
      return HttpCode.HTTP_NOT_FOUND.getValue();

    case Code.ALREADY_EXISTS.getValue():
      return HttpCode.HTTP_CONFLICT.getValue();

    case Code.PERMISSION_DENIED.getValue():
      return HttpCode.HTTP_FORBIDDEN.getValue();

    case Code.UNAUTHENTICATED.getValue():
      return HttpCode.HTTP_UNAUTHORIZED.getValue();

    case Code.RESOURCE_EXHAUSTED.getValue():
      return HttpCode.HTTP_TOO_MANY_REQUESTS.getValue();

    // questionable... may not always be etag related.
    case Code.FAILED_PRECONDITION.getValue():
      return HttpCode.HTTP_PRECONDITION_FAILED.getValue();

    case Code.ABORTED.getValue():
      return HttpCode.HTTP_CONFLICT.getValue();

    case Code.OUT_OF_RANGE.getValue():
      return HttpCode.HTTP_BAD_REQUEST.getValue();

    case Code.UNIMPLEMENTED.getValue():
      return HttpCode.HTTP_NOT_IMPLEMENTED.getValue();

    case Code.INTERNAL.getValue():
      return HttpCode.HTTP_INTERNAL_SERVER_ERROR.getValue();

    case Code.UNAVAILABLE.getValue():
      return HttpCode.HTTP_SERVICE_UNAVAILABLE.getValue();

    case Code.DATA_LOSS.getValue():
      return HttpCode.HTTP_INTERNAL_SERVER_ERROR.getValue();

    default:
      return HttpCode.HTTP_UNPROCESSABLE_ENTITY.getValue();
  }
}

/**
 * Convert an http status code to our "Code" aka vendor code.
 *
 * @param {number} httpCode
 *
 * @returns {number}
 */
export function httpToVendor(httpCode = HttpCode.HTTP_OK.getValue()) {
  if (httpCode < 400) {
    return Code.OK.getValue();
  }

  switch (httpCode) {
    case HttpCode.HTTP_CLIENT_CLOSED_REQUEST.getValue():
      return Code.CANCELLED.getValue();

    case HttpCode.HTTP_INTERNAL_SERVER_ERROR.getValue():
      return Code.INTERNAL.getValue();

    case HttpCode.HTTP_GATEWAY_TIMEOUT.getValue():
      return Code.DEADLINE_EXCEEDED.getValue();

    case HttpCode.HTTP_NOT_FOUND.getValue():
      return Code.NOT_FOUND.getValue();

    case HttpCode.HTTP_CONFLICT.getValue():
      return Code.ALREADY_EXISTS.getValue();

    case HttpCode.HTTP_FORBIDDEN.getValue():
      return Code.PERMISSION_DENIED.getValue();

    case HttpCode.HTTP_UNAUTHORIZED.getValue():
      return Code.UNAUTHENTICATED.getValue();

    case HttpCode.HTTP_TOO_MANY_REQUESTS.getValue():
      return Code.RESOURCE_EXHAUSTED.getValue();

    case HttpCode.HTTP_PRECONDITION_FAILED.getValue():
      return Code.FAILED_PRECONDITION.getValue();

    case HttpCode.HTTP_NOT_IMPLEMENTED.getValue():
      return Code.UNIMPLEMENTED.getValue();

    case HttpCode.HTTP_SERVICE_UNAVAILABLE.getValue():
      return Code.UNAVAILABLE.getValue();

    default:
      if (httpCode >= 500) {
        return Code.INTERNAL.getValue();
      }

      if (httpCode >= 400) {
        return Code.INVALID_ARGUMENT.getValue();
      }

      return Code.OK.getValue();
  }
}

export default { vendorToHttp, httpToVendor };
