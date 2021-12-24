import test from 'tape';
import Dispatcher from '../src/Dispatcher.js';


test('Dispatcher with arrow function tests', async (t) => {
  const dispatcher = new Dispatcher();

  let called = 0;
  const listener1 = () => called += 1;
  const listener2 = () => called += 1;

  dispatcher.addListener('test1', listener1);
  dispatcher.addListener('test1', listener2);
  dispatcher.addListener('test2', listener2);
  await dispatcher.dispatch('test1');
  await dispatcher.dispatch('test1');
  await dispatcher.dispatch('test2');

  t.same(called, 5);
  t.true(dispatcher.hasListeners('test1'));
  t.true(dispatcher.hasListeners('test2'));
  t.false(dispatcher.hasListeners('test3'));
  t.same(dispatcher.getListeners('test1'), [listener1, listener2]);
  t.same(dispatcher.getListeners('test2'), [listener2]);

  dispatcher.removeListener('test2', listener2);
  await dispatcher.dispatch('test1');
  await dispatcher.dispatch('test2');
  t.same(called, 7);
  t.false(dispatcher.hasListeners('test2'));
  t.same(dispatcher.getListeners('test2'), []);

  t.end();
});


test('Dispatcher with class tests', async (t) => {
  const dispatcher = new Dispatcher();

  let called = 0;

  class Listener {
    constructor(instanceVar) {
      this.instanceVar = instanceVar;
    }

    test(event) {
      called += 1;
      event.instanceVar = `${this.instanceVar}-${called}`;
    }
  }

  const listener = new Listener('somestring');
  dispatcher.addListener('test', listener.test.bind(listener));

  let event = await dispatcher.dispatch('test');
  t.same(called, 1);
  t.same(event.instanceVar, 'somestring-1');

  event = await dispatcher.dispatch('test');
  t.same(called, 2);
  t.same(event.instanceVar, 'somestring-2');

  await dispatcher.dispatch('test2');
  t.same(called, 2);

  t.end();
});
