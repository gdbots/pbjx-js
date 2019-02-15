/* eslint-disable no-unused-vars */
import EchoResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoResponseV1';
import RequestHandler from './RequestHandler';

export default class EchoRequestHandler extends RequestHandler {
  async handleRequest(request, pbjx) {
    return EchoResponseV1.create().set('msg', request.get('msg'));
  }
}
