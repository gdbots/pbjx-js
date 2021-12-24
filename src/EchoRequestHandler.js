import EchoResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoResponseV1.js';

export default class EchoRequestHandler {
  async handleRequest(request, pbjx) {
    return EchoResponseV1.create().set('msg', request.get('msg'));
  }
}
