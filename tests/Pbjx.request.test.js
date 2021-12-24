import test from 'tape';
import 'isomorphic-fetch';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1.js';
import EchoResponseV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoResponseV1.js';
import { REQUEST_BUS_EXCEPTION, SUFFIX_AFTER_HANDLE, SUFFIX_BEFORE_HANDLE } from '../src/constants.js';
import HandlerNotFound from '../src/exceptions/HandlerNotFound.js';
import LogicException from '../src/exceptions/LogicException.js';
import PbjxEvent from '../src/events/PbjxEvent.js';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator.js';
import RequestHandlingFailed from '../src/exceptions/RequestHandlingFailed.js';


class TestHandler {
  async handleRequest(request, pbjx) {
    if (request.get('msg') === 'failing') {
      throw new LogicException(request.get('msg'));
    }

    return EchoResponseV1.create().set('msg', request.get('msg'));
  }
}


test('Pbjx.request (simulated passing) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = await locator.getPbjx();
  const dispatcher = await locator.getDispatcher();
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

  dispatcher.addListener(
    `${EchoRequestV1.schema().getCurie()}.${SUFFIX_BEFORE_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  dispatcher.addListener(
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
  const pbjx = await locator.getPbjx();
  const dispatcher = await locator.getDispatcher();
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
  dispatcher.addListener(
    `${EchoRequestV1.schema().getCurie()}.${SUFFIX_AFTER_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  dispatcher.addListener(REQUEST_BUS_EXCEPTION, checker.bind(this));

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
  const pbjx = await locator.getPbjx();
  const dispatcher = await locator.getDispatcher();

  /**
   * @param {BusExceptionEvent} event
   */
  const checker = (event) => {
    const e = event.getException();
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
  };

  dispatcher.addListener(REQUEST_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.request(EchoRequestV1.create().set('msg', 'no_handler'));
  } catch (e) {
    t.true(e instanceof RequestHandlingFailed, 'Exception MUST be an instanceOf RequestHandlingFailed');
    t.same(e.getRequest().get('msg'), 'no_handler');
  }

  t.end();
});
