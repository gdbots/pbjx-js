/* eslint-disable class-methods-use-this, no-param-reassign, no-return-assign */
import test from 'tape';
import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1';
import Dispatcher from '../src/Dispatcher';
import EventSubscriber from '../src/EventSubscriber';


test('Dispatcher with arrow function tests', (t) => {
  const dispatcher = new Dispatcher();

  let called = 0;
  const listener1 = () => called += 1;
  const listener2 = () => called += 1;

  dispatcher.addListener('test1', listener1);
  dispatcher.addListener('test1', listener2);
  dispatcher.addListener('test2', listener2);
  dispatcher.dispatch('test1');
  dispatcher.dispatch('test1');
  dispatcher.dispatch('test2');

  t.same(called, 5);
  t.true(dispatcher.hasListeners('test1'));
  t.true(dispatcher.hasListeners('test2'));
  t.false(dispatcher.hasListeners('test3'));
  t.same(dispatcher.getListeners('test1'), [listener1, listener2]);
  t.same(dispatcher.getListeners('test2'), [listener2]);

  dispatcher.removeListener('test2', listener2);
  dispatcher.dispatch('test1');
  dispatcher.dispatch('test2');
  t.same(called, 7);
  t.false(dispatcher.hasListeners('test2'));
  t.same(dispatcher.getListeners('test2'), []);

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
      called += 1;
      event.instanceVar = `${this.instanceVar}-${called}`;
    }
  }

  const listener = new Listener('somestring');
  dispatcher.addListener('test', listener.test.bind(listener));

  let event = dispatcher.dispatch('test');
  t.same(called, 1);
  t.same(event.instanceVar, 'somestring-1');

  event = dispatcher.dispatch('test');
  t.same(called, 2);
  t.same(event.instanceVar, 'somestring-2');

  dispatcher.dispatch('test2');
  t.same(called, 2);

  t.end();
});


test('Dispatcher with subscriber tests', (t) => {
  const dispatcher = new Dispatcher();

  let called = 0;

  class Subscriber extends EventSubscriber {
    constructor(instanceVar) {
      super();
      this.instanceVar = instanceVar;

      this.test = this.test.bind(this);
      this.onEvent = this.onEvent.bind(this);
    }

    test(event) {
      called += 1;
      event.instanceVar = `${this.instanceVar}-${called}`;
    }

    onHealthChecked(event) {
      t.true(event.schema().getCurie().toString() === 'gdbots:pbjx:event:health-checked');
      t.same(`test${called}`, event.get('msg'));
      called += 1;
    }

    getSubscribedEvents() {
      return {
        test: this.test,
        'gdbots:pbjx:*': this.onEvent,
      };
    }
  }

  const subscriber = new Subscriber('somestring');
  dispatcher.addSubscriber(subscriber);
  t.true(dispatcher.hasListeners('gdbots:pbjx:*'));

  let event = dispatcher.dispatch('test');
  t.same(called, 1);
  t.same(event.instanceVar, 'somestring-1');

  event = dispatcher.dispatch('test');
  t.same(called, 2);
  t.same(event.instanceVar, 'somestring-2');

  dispatcher.dispatch('test2');
  t.same(called, 2);

  subscriber.onEvent(HealthCheckedV1.create().set('msg', 'test2'));
  subscriber.onEvents([
    HealthCheckedV1.create().set('msg', 'test3'),
    HealthCheckedV1.create().set('msg', 'test4'),
  ]);
  t.same(called, 5);

  dispatcher.removeSubscriber(subscriber);
  dispatcher.dispatch('gdbots:pbjx:*');
  t.same(called, 5);
  t.false(dispatcher.hasListeners('gdbots:pbjx:*'));

  t.end();
});
