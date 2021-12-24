import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1.js';
import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1.js';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1.js';
import EchoResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoResponseV1.js';
import RegisteringServiceLocator from '../../src/RegisteringServiceLocator.js';
import HttpTransport from '../../src/transports/HttpTransport.js';
import EnvelopeReceivedEvent from '../../src/events/EnvelopeReceivedEvent.js';
import { TRANSPORT_HTTP_ENVELOPE_RECEIVED } from '../../src/constants.js';


test('HttpTransport tests', async (t) => {
  if (!process.env.PBJX_ENDPOINT) {
    t.skip('Set environment variable "PBJX_ENDPOINT" to run this test.');
    t.end();
    return;
  }

  const locator = new RegisteringServiceLocator();
  const dispatcher = await locator.getDispatcher();
  const transport = new HttpTransport(locator, process.env.PBJX_ENDPOINT);
  let called = 0;

  const checker = (event) => {
    t.true(event instanceof EnvelopeReceivedEvent, 'Event MUST be an instanceOf EnvelopeReceivedEvent');
    t.true(event.getEnvelope().get('ok'));
    called += 1;

    if (event.getMessage().schema().getCurie().toString() === 'gdbots:pbjx:request:echo-request') {
      t.same(event.getEnvelope().get('message_ref').getCurie().toString(), 'gdbots:pbjx:request:echo-response');
      return;
    }

    t.same(event.getEnvelope().get('message_ref').getCurie(), event.getMessage().schema().getCurie());
  };

  dispatcher.addListener(TRANSPORT_HTTP_ENVELOPE_RECEIVED, checker.bind(this));

  try {
    t.comment('sendCommand test');
    await transport.sendCommand(CheckHealthV1.create().set('msg', 'sendCommand test'));
  } catch (e) {
    t.fail(e);
  }

  try {
    t.comment('sendRequest test');
    const response = await transport.sendRequest(EchoRequestV1.create().set('msg', 'sendRequest test'));
    t.true(response instanceof EchoResponseV1, 'Response MUST be an instanceOf EchoResponseV1');
    t.same(response.get('msg'), 'sendRequest test');
  } catch (e) {
    t.fail(e);
  }

  try {
    t.comment('sendEvent test');
    await transport.sendEvent(HealthCheckedV1.create().set('msg', 'sendEvent test'));
  } catch (e) {
    t.fail(e);
  }

  t.same(called, 3);

  t.end();
});
