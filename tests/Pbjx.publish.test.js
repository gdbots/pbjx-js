import test from 'tape';
import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1';
import LogicException from '../src/exceptions/LogicException';
import RegisteringServiceLocator from '../src/RegisteringServiceLocator';


test('Pbjx.publish tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const dispatcher = await locator.getDispatcher();
  const pbjx = await locator.getPbjx();
  const event = HealthCheckedV1.create().set('msg', 'test');

  let called = 0;
  const checker = () => called += 1;
  const boundChecker = checker.bind(this);

  dispatcher.addListener('gdbots:pbjx:mixin:event:v1', boundChecker);
  dispatcher.addListener('gdbots:pbjx:mixin:event', boundChecker);

  dispatcher.addListener('gdbots:pbjx:event:health-checked:v1', boundChecker);
  dispatcher.addListener('gdbots:pbjx:event:health-checked', boundChecker);
  dispatcher.addListener('gdbots:pbjx:*', boundChecker);
  dispatcher.addListener('*', boundChecker);

  await pbjx.publish(event);
  t.same(called, 6);

  t.end();
});


test('Pbjx.publish (simulated failing) tests', async (t) => {
  const locator = new RegisteringServiceLocator();
  const dispatcher = await locator.getDispatcher();
  const pbjx = await locator.getPbjx();
  const event = HealthCheckedV1.create().set('msg', 'test');

  let called = 0;
  const checker = () => called += 1;
  const boundChecker = checker.bind(this);

  let failed = 0;
  const failer = (evt) => {
    failed += 1;
    throw new LogicException(`failing:${evt.get('msg')}`);
  };
  const boundFailer = failer.bind(this);

  dispatcher.addListener('gdbots:pbjx:event:health-checked', boundChecker);
  dispatcher.addListener('gdbots:pbjx:event:health-checked:v1', boundFailer);
  dispatcher.addListener('gdbots:pbjx:event:health-checked', boundFailer);

  // should get called on each failure (twice)
  dispatcher.addListener('gdbots:pbjx:event:event-execution-failed', boundChecker);

  await pbjx.publish(event);
  t.same(called, 3);
  t.same(failed, 2);

  t.end();
});
