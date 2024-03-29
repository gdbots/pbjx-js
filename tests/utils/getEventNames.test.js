import test from 'tape';
import EchoRequestV1 from '@gdbots/schemas/gdbots/pbjx/request/EchoRequestV1.js';
import getEventNames from '../../src/utils/getEventNames.js';

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
    'gdbots:pbjx:*',
    '*',
  ]);

  t.same(getEventNames(request, '.test', true), [
    'gdbots:pbjx:mixin:request:v1.test',
    'gdbots:pbjx:mixin:request.test',
    'gdbots:pbjx:request:echo-request:v1.test',
    'gdbots:pbjx:request:echo-request.test',
    'gdbots:pbjx:*',
    '*',
  ]);

  t.end();
});
