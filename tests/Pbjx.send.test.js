import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1.js';
import { COMMAND_BUS_EXCEPTION, SUFFIX_AFTER_HANDLE, SUFFIX_BEFORE_HANDLE } from '../src/constants.js';
import HandlerNotFound from '../src/exceptions/HandlerNotFound.js';
import LogicException from '../src/exceptions/LogicException.js';
import PbjxEvent from '../src/events/PbjxEvent.js';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator.js';

class TestHandler {
  constructor() {
    this.handled = false;
  }

  async handleCommand(command, pbjx) {
    if (command.get('msg') === 'passing') {
      this.handled = true;
      return;
    }

    if (command.get('msg') === 'failing') {
      throw new LogicException(command.get('msg'));
    }
  }
}


test('Pbjx.send (simulated passing) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = await locator.getPbjx();
  const dispatcher = await locator.getDispatcher();
  const handler = new TestHandler();
  locator.registerCommandHandler(CheckHealthV1.schema().getCurie(), handler);
  t.same(`${dispatcher}`, `${handler}`);

  /**
   * @param {PbjxEvent} event
   */
  const lifecycleChecker = (event) => {
    t.true(event instanceof PbjxEvent, 'Event MUST be an instanceOf PbjxEvent');
    t.true(event.getMessage() instanceof CheckHealthV1, 'Message MUST be an instanceOf CheckHealthV1');
    t.same(event.getMessage().get('msg'), 'passing');
  };

  dispatcher.addListener(
    `${CheckHealthV1.schema().getCurie()}.${SUFFIX_BEFORE_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  dispatcher.addListener(
    `${CheckHealthV1.schema().getCurie()}.${SUFFIX_AFTER_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  try {
    await pbjx.send(CheckHealthV1.create().set('msg', 'passing'));
  } catch (e) {
    t.fail(e);
  }

  t.true(handler.handled);
  t.end();
});


test('Pbjx.send (simulated failing) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = await locator.getPbjx();
  const dispatcher = await locator.getDispatcher();
  const handler = new TestHandler();
  locator.registerCommandHandler(CheckHealthV1.schema().getCurie(), handler);

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
    `${CheckHealthV1.schema().getCurie()}.${SUFFIX_AFTER_HANDLE}`,
    lifecycleChecker.bind(this),
  );

  dispatcher.addListener(COMMAND_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.send(CheckHealthV1.create().set('msg', 'failing'));
  } catch (e) {
    t.true(e instanceof LogicException, 'Exception MUST be an instanceOf LogicException');
    t.same(e.message, 'failing');
  }

  t.false(handler.handled);
  t.end();
});


test('Pbjx.send (HandlerNotFound) tests', async (t) => {
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

  dispatcher.addListener(COMMAND_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.send(CheckHealthV1.create());
  } catch (e) {
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
  }

  t.end();
});
