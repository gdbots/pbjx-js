/* eslint-disable no-return-assign */
import test from 'tape';
import CheckHealthV1 from '@gdbots/schemas/gdbots/pbjx/command/CheckHealthV1';
import * as constants from '../src/constants';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator';

test('Pbjx.trigger tests', (t) => {
  const locator = new RegisteringServiceLocator();
  const pbjx = locator.getPbjx();
  let called = 0;

  const checker = () => called += 1;
  const boundChecker = checker.bind(this);
  const curie = CheckHealthV1.schema().getCurie();
  const commandCurie = 'gdbots:pbjx:mixin:command';
  const lifecycle = `${constants.EVENT_PREFIX}message`;

  locator.getDispatcher().addListener(`${lifecycle}.${constants.SUFFIX_BIND}`, boundChecker);
  locator.getDispatcher().addListener(`${curie}.${constants.SUFFIX_BIND}`, boundChecker);
  locator.getDispatcher().addListener(`${commandCurie}.${constants.SUFFIX_BIND}`, boundChecker);

  locator.getDispatcher().addListener(`${lifecycle}.${constants.SUFFIX_VALIDATE}`, boundChecker);
  locator.getDispatcher().addListener(`${curie}.${constants.SUFFIX_VALIDATE}`, boundChecker);
  locator.getDispatcher().addListener(`${commandCurie}.${constants.SUFFIX_VALIDATE}`, boundChecker);

  locator.getDispatcher().addListener(`${lifecycle}.${constants.SUFFIX_ENRICH}`, boundChecker);
  locator.getDispatcher().addListener(`${curie}.${constants.SUFFIX_ENRICH}`, boundChecker);
  locator.getDispatcher().addListener(`${commandCurie}.${constants.SUFFIX_ENRICH}`, boundChecker);

  pbjx.triggerLifecycle(CheckHealthV1.create());

  t.same(called, 9);
  t.end();
});
