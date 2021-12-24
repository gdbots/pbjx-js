import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1.js';
import * as constants from '../src/constants.js';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator.js';

test('Pbjx.trigger tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const dispatcher = await locator.getDispatcher();
  const pbjx = await locator.getPbjx();
  let called = 0;

  const checker = () => called += 1;
  const boundChecker = checker.bind(this);
  const curie = CheckHealthV1.schema().getCurie();
  const commandCurie = 'gdbots:pbjx:mixin:command';
  const lifecycle = `${constants.EVENT_PREFIX}message`;

  dispatcher.addListener(`${lifecycle}.${constants.SUFFIX_BIND}`, boundChecker);
  dispatcher.addListener(`${curie}.${constants.SUFFIX_BIND}`, boundChecker);
  dispatcher.addListener(`${commandCurie}.${constants.SUFFIX_BIND}`, boundChecker);

  dispatcher.addListener(`${lifecycle}.${constants.SUFFIX_VALIDATE}`, boundChecker);
  dispatcher.addListener(`${curie}.${constants.SUFFIX_VALIDATE}`, boundChecker);
  dispatcher.addListener(`${commandCurie}.${constants.SUFFIX_VALIDATE}`, boundChecker);

  dispatcher.addListener(`${lifecycle}.${constants.SUFFIX_ENRICH}`, boundChecker);
  dispatcher.addListener(`${curie}.${constants.SUFFIX_ENRICH}`, boundChecker);
  dispatcher.addListener(`${commandCurie}.${constants.SUFFIX_ENRICH}`, boundChecker);

  await pbjx.triggerLifecycle(CheckHealthV1.create());

  t.same(called, 9);
  t.end();
});
