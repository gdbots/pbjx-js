import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1';
import CommandHandler from '../src/CommandHandler';
import HandlerNotFound from '../src/exceptions/HandlerNotFound';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator';
import RequestHandler from '../src/RequestHandler';

test('RegisteringServiceLocator tests', (t) => {
  const locator = new RegisteringServiceLocator();

  const handler1 = new (class Handler extends RequestHandler {
  })();
  locator.registerRequestHandler(EchoRequestV1.schema().getCurie(), handler1);
  t.true(locator.getRequestHandler(EchoRequestV1.schema().getCurie()) === handler1);

  try {
    locator.getCommandHandler(CheckHealthV1.schema().getCurie());
    t.fail('found CommandHandler that does not exist');
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
    t.pass(e.message);
  }

  const handler2 = new (class Handler extends CommandHandler {
  })();
  locator.registerCommandHandler(CheckHealthV1.schema().getCurie(), handler2);
  t.true(locator.getCommandHandler(CheckHealthV1.schema().getCurie()) === handler2);

  t.end();
});
