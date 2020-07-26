import GdbotsPbjxException from './GdbotsPbjxException';

export default class RequestHandlingFailed extends GdbotsPbjxException {
  /**
   * @param {Message} response
   */
  constructor(response) {
    const ref = response.get('ctx_request_ref') || response.get('ctx_request').get('request_id');
    const errName = response.get('error_name');
    const errCode = response.get('error_code', 2);
    const errMsg = response.get('error_message');
    super(`Request [${ref}] could not be handled. ${errName}::${errCode}::${errMsg}`, errCode);
    this.response = response;
  }

  /**
   * @returns {Message}
   */
  getResponse() {
    return this.response;
  }

  /**
   * @returns {Message}
   */
  getRequest() {
    return this.response.get('ctx_request');
  }
}
