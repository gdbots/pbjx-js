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

test('ServiceLocator tests', (t) => {
  const locator = new ServiceLocator();

  // we assert that we can get the service AND that
  // it returns the same instance each time
  t.true(locator.getPbjx() instanceof Pbjx);
  t.true(locator.getPbjx() === locator.getPbjx());
  t.true(locator.getDispatcher() instanceof Dispatcher);
  t.true(locator.getDispatcher() === locator.getDispatcher());
  t.true(locator.getCommandBus() instanceof CommandBus);
  t.true(locator.getCommandBus() === locator.getCommandBus());
  t.true(locator.getEventBus() instanceof EventBus);
  t.true(locator.getEventBus() === locator.getEventBus());
  t.true(locator.getRequestBus() instanceof RequestBus);
  t.true(locator.getRequestBus() === locator.getRequestBus());
  t.true(locator.getExceptionHandler() instanceof ExceptionHandler);
  t.true(locator.getExceptionHandler() === locator.getExceptionHandler());
  t.true(locator.getDefaultTransport() instanceof InMemoryTransport);
  t.true(locator.getDefaultTransport() === locator.getDefaultTransport());

  try {
    locator.getCommandHandler(SchemaCurie.fromString('acme:iam:command:create-user'));
    t.fail('found CommandHandler that does not exist');
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
    t.pass(e.message);
  }

  try {
    locator.getRequestHandler(SchemaCurie.fromString('acme:iam:request:get-user'));
    t.fail('found RequestHandler that does not exist');
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
    t.pass(e.message);
  }

  class FakeTransport extends Transport {}
  const fakeTransport = new FakeTransport(locator, 'fake');
  locator.setDefaultTransport(fakeTransport);
  t.true(locator.getDefaultTransport() instanceof FakeTransport);
  t.true(locator.getDefaultTransport() === locator.getDefaultTransport());

  t.end();
});
