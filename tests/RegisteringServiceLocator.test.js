import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1.js';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1.js';
import HandlerNotFound from '../src/exceptions/HandlerNotFound.js';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator.js';

test('RegisteringServiceLocator tests', async (t) => {
  const locator = new RegisteringServiceLocator();

  const handler1 = new (class Handler {})();
  locator.registerRequestHandler(EchoRequestV1.schema().getCurie(), handler1);
  t.true(await locator.getRequestHandler(EchoRequestV1.schema().getCurie()) === handler1);

  try {
    await locator.getCommandHandler(CheckHealthV1.schema().getCurie());
    t.fail('found CommandHandler that does not exist');
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
    t.pass(e.message);
  }

  const handler2 = new (class Handler {})();
  await locator.registerCommandHandler(CheckHealthV1.schema().getCurie(), handler2);
  t.true(await locator.getCommandHandler(CheckHealthV1.schema().getCurie()) === handler2);

  t.end();
});
