import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1';
import { COMMAND_BUS_EXCEPTION } from '../src/pbjxEvents';
import CommandHandler from '../src/CommandHandler';
import HandlerNotFound from '../src/exceptions/HandlerNotFound';
import LogicException from '../src/exceptions/LogicException';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator';

class TestHandler extends CommandHandler {
  constructor() {
    super();
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
  const pbjx = locator.getPbjx();
  const handler = new TestHandler();
  locator.registerCommandHandler(CheckHealthV1.schema().getCurie(), handler);

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
  const pbjx = locator.getPbjx();
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

  locator.getDispatcher().addListener(COMMAND_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.send(CheckHealthV1.create().set('msg', 'failing'));
  } catch (e) {
    t.fail(e);
  }

  t.false(handler.handled);
  t.end();
});


test('Pbjx.send (HandlerNotFound) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = locator.getPbjx();

  /**
   * @param {BusExceptionEvent} event
   */
  const checker = (event) => {
    const e = event.getException();
    t.true(e instanceof HandlerNotFound, 'Exception MUST be an instanceOf HandlerNotFound');
  };

  locator.getDispatcher().addListener(COMMAND_BUS_EXCEPTION, checker.bind(this));

  try {
    await pbjx.send(CheckHealthV1.create());
  } catch (e) {
    t.fail(e);
  }

  t.end();
});
