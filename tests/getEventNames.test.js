import test from 'tape';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1';
import getEventNames from '../src/getEventNames';

test('getEventNames tests', (t) => {
  const request = EchoRequestV1.create();

  t.same(getEventNames(request), [
    'gdbots:pbjx:mixin:request:v1',
    'gdbots:pbjx:mixin:request',
    'gdbots:pbjx:request:echo-request:v1',
    'gdbots:pbjx:request:echo-request',
  ]);

  t.same(getEventNames(request, '.test'), [
    'gdbots:pbjx:mixin:request:v1.test',
    'gdbots:pbjx:mixin:request.test',
    'gdbots:pbjx:request:echo-request:v1.test',
    'gdbots:pbjx:request:echo-request.test',
  ]);

  t.same(getEventNames(request, '', true), [
    'gdbots:pbjx:mixin:request:v1',
    'gdbots:pbjx:mixin:request',
    'gdbots:pbjx:request:echo-request:v1',
    'gdbots:pbjx:request:echo-request',
    'gdbots:pbjx:request:*',
    'gdbots:pbjx:*',
    'gdbots:*',
    '*',
  ]);

  t.same(getEventNames(request, '.test', true), [
    'gdbots:pbjx:mixin:request:v1.test',
    'gdbots:pbjx:mixin:request.test',
    'gdbots:pbjx:request:echo-request:v1.test',
    'gdbots:pbjx:request:echo-request.test',
    'gdbots:pbjx:request:*',
    'gdbots:pbjx:*',
    'gdbots:*',
    '*',
  ]);

  t.end();
});
