import test from 'tape';
import Dispatcher from '../src/Dispatcher';

test('Dispatcher with arrow function tests', (t) => {
  const dispatcher = new Dispatcher();

  let called = 0;
  const listener = () => called++;

  dispatcher.addListener('test', listener);
  dispatcher.dispatch('test');
  dispatcher.dispatch('test');

  t.same(called, 2);
  t.true(dispatcher.hasListeners('test'));
  t.false(dispatcher.hasListeners('test2'));
  t.same(dispatcher.getListeners('test'), [listener]);

  t.end();
});


test('Dispatcher with class tests', (t) => {
  const dispatcher = new Dispatcher();

  let called = 0;
  class Listener {
    constructor(instanceVar) {
      this.instanceVar = instanceVar;
    }

    test(event) {
      called++;
      event.instanceVar = `${this.instanceVar}-${called}`;
    }
  }

  const listener = new Listener('somestring');
  dispatcher.addListener('test', listener.test.bind(listener));

  let pbjxEvent = dispatcher.dispatch('test');
  t.same(called, 1);
  t.same(pbjxEvent.instanceVar, 'somestring-1');

  pbjxEvent = dispatcher.dispatch('test');
  t.same(called, 2);
  t.same(pbjxEvent.instanceVar, 'somestring-2');

  dispatcher.dispatch('test2');
  t.same(called, 2);

  t.end();
});
