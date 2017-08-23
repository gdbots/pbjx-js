/* eslint-disable class-methods-use-this */
import test from 'tape';
import HealthCheckedV1 from '@gdbots/schemas/gdbots/pbjx/event/HealthCheckedV1';
import createReducer from '../../src/redux/createReducer';
import { actionTypes, STATE_FULFILLED } from '../../src/constants';

test('Redux createReducer tests', (t) => {
  const reducer = createReducer();

  let called = 0;

  const listener = (state, pbj) => {
    called += 1;
    return {
      ...state,
      test: pbj.get('msg'),
    };
  };
  const boundListener = listener.bind(this);

  const action = {
    type: actionTypes.FULFILLED,
    pbj: HealthCheckedV1.create().set('msg', 'after'),
    pbjx: {
      method: 'publish',
      state: STATE_FULFILLED,
    },
  };

  reducer.subscribe('gdbots:pbjx:*', boundListener);

  t.same({ test: 'after' }, reducer({ test: 'before' }, action));
  t.same(called, 1);

  reducer.unsubscribe('gdbots:pbjx:*', boundListener);
  t.same({ test: 'before' }, reducer({ test: 'before' }, action));
  t.same(called, 1);

  t.end();
});
