/* eslint-disable class-methods-use-this, no-unused-vars */
import test from 'tape';
import 'isomorphic-fetch';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1';
import EchoResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoResponseV1';
import { REQUEST_BUS_EXCEPTION, SUFFIX_AFTER_HANDLE, SUFFIX_BEFORE_HANDLE } from '../src/constants';
import RequestHandler from '../src/RequestHandler';
import HandlerNotFound from '../src/exceptions/HandlerNotFound';
import LogicException from '../src/exceptions/LogicException';
import PbjxEvent from '../src/events/PbjxEvent';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator';
import RequestHandlingFailed from '../src/exceptions/RequestHandlingFailed';
import HttpTransport from '../src/transports/HttpTransport';

class TestHandler extends RequestHandler {
  async handleRequest(request, pbjx) {
    if (request.get('msg') === 'failing') {
      throw new LogicException(request.get('msg'));
    }

    return EchoResponseV1.create().set('msg', request.get('msg'));
  }
}


test('Pbjx.request (simulated passing) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  locator.setDefaultTransport(new HttpTransport(locator, 'https://localhost/pbjx'));
  const pbjx = locator.getPbjx();
  const handler = new TestHandler();
  locator.registerRequestHandler(EchoRequestV1.schema().getCurie(), handler);

  /**
   * @param {PbjxEvent} event
   */
  const lifecycleChecker = (event) => {
    t.true(event instanceof PbjxEvent, 'Event MUST be an instanceOf PbjxEvent');
    t.true(event.getMessage() instanceof EchoRequestV1, 'Message MUST be an instanceOf EchoRequestV1');
    t.same(event.getMessage().get('msg'), 'passing');
  };

  locator.getDispatcher().addListener(
    `${EchoRequestV1.schema().getCurie()}.${SUFFIX_BEFORE_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  locator.getDispatcher().addListener(
    `${EchoRequestV1.schema().getCurie()}.${SUFFIX_AFTER_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  try {
    const response = await pbjx.request(EchoRequestV1.create().set('msg', 'passing'));
    t.same(response.get('msg'), 'passing');
  } catch (e) {
    t.fail(e);
  }

  t.end();
});


test('Pbjx.request (simulated failing) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = locator.getPbjx();
  const handler = new TestHandler();
  locator.registerRequestHandler(EchoRequestV1.schema().getCurie(), handler);

  /**
   * @param {BusExceptionEvent} event
   */
  const checker = (event) => {
    const e = event.getException();
    t.true(e instanceof LogicException, 'Exception MUST be an instanceOf LogicException');
    t.same(e.message, 'failing');
  };

  const lifecycleChecker = () => t.fail(`a failing message MUST NOT call ${SUFFIX_AFTER_HANDLE}`);
  locator.getDispatcher().addListener(
    `${EchoRequestV1.schema().getCurie()}.${SUFFIX_AFTER_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  locator.getDispatcher().addListener(REQUEST_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.request(EchoRequestV1.create().set('msg', 'failing'));
  } catch (e) {
    t.true(e instanceof RequestHandlingFailed, 'Exception MUST be an instanceOf RequestHandlingFailed');
    t.same(e.getRequest().get('msg'), 'failing');
  }

  t.end();
});


test('Pbjx.request (HandlerNotFound) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = locator.getPbjx();

  /**
   * @param {BusExceptionEvent} event
   */
  const checker = (event) => {
    const e = event.getException();
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
  };

  locator.getDispatcher().addListener(REQUEST_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.request(EchoRequestV1.create().set('msg', 'no_handler'));
  } catch (e) {
    t.true(e instanceof RequestHandlingFailed, 'Exception MUST be an instanceOf RequestHandlingFailed');
    t.same(e.getRequest().get('msg'), 'no_handler');
  }

  t.end();
});
