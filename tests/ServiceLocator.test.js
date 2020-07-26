import test from 'tape';
import SchemaCurie from '@gdbots/pbj/SchemaCurie';
import CommandBus from '../src/CommandBus';
import Dispatcher from '../src/Dispatcher';
import EventBus from '../src/EventBus';
import ExceptionHandler from '../src/ExceptionHandler';
import InMemoryTransport from '../src/transports/InMemoryTransport';
import Pbjx from '../src/Pbjx';
import RequestBus from '../src/RequestBus';
import ServiceLocator from '../src/ServiceLocator';
import HandlerNotFound from '../src/exceptions/HandlerNotFound';
import Transport from '../src/transports/Transport';

test('ServiceLocator tests', async (t) => {
  const locator = new ServiceLocator();

  // we assert that we can get the service AND that
  // it returns the same instance each time
  t.true(await locator.getPbjx() instanceof Pbjx);
  t.true(await locator.getPbjx() === await locator.getPbjx());
  t.true(await locator.getDispatcher() instanceof Dispatcher);
  t.true(await locator.getDispatcher() === await locator.getDispatcher());
  t.true(await locator.getCommandBus() instanceof CommandBus);
  t.true(await locator.getCommandBus() === await locator.getCommandBus());
  t.true(await locator.getEventBus() instanceof EventBus);
  t.true(await locator.getEventBus() === await locator.getEventBus());
  t.true(await locator.getRequestBus() instanceof RequestBus);
  t.true(await locator.getRequestBus() === await locator.getRequestBus());
  t.true(await locator.getExceptionHandler() instanceof ExceptionHandler);
  t.true(await locator.getExceptionHandler() === await locator.getExceptionHandler());
  t.true(await locator.getDefaultTransport() instanceof InMemoryTransport);
  t.true(await locator.getDefaultTransport() === await locator.getDefaultTransport());

  try {
    await locator.getCommandHandler(SchemaCurie.fromString('acme:iam:command:create-user'));
    t.fail('found CommandHandler that does not exist');
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
    t.pass(e.message);
  }

  try {
    await locator.getRequestHandler(SchemaCurie.fromString('acme:iam:request:get-user'));
    t.fail('found RequestHandler that does not exist');
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
    t.pass(e.message);
  }

  class FakeTransport extends Transport {}
  const fakeTransport = new FakeTransport(locator, 'fake');
  locator.setDefaultTransport(fakeTransport);
  t.true(await locator.getDefaultTransport() instanceof FakeTransport);
  t.true(await locator.getDefaultTransport() === await locator.getDefaultTransport());

  t.end();
});
