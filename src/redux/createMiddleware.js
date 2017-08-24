import Exception from '@gdbots/common/Exception';
import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code';
import Message from '@gdbots/pbj/Message';
import LogicException from '../exceptions/LogicException';
import { actionTypes, STATE_FULFILLED, STATE_REJECTED, STATE_STARTED } from '../constants';
import PbjxEvent from '../events/PbjxEvent';

const startPbjxAction = (pbj, method) => ({
  type: actionTypes.STARTED,
  pbj,
  pbjx: {
    method,
    state: STATE_STARTED,
  },
});

const rejectPbjxAction = (pbj, method, exception) => ({
  type: actionTypes.REJECTED,
  pbj,
  pbjx: {
    method,
    state: STATE_REJECTED,
    code: exception.getCode() || Code.UNKNOWN.getValue(),
    exception,
  },
});

const fulfillPbjxAction = (pbj, method) => ({
  type: actionTypes.FULFILLED,
  pbj,
  pbjx: {
    method,
    state: STATE_FULFILLED,
  },
});

/**
 * @param {Pbjx} pbjx
 *
 * @returns {function}
 */
export default function createMiddleware(pbjx) {
  return store => next => (pbj) => {
    if (!(pbj instanceof Message)) {
      next(pbj);
      return;
    }

    PbjxEvent.setRedux(store);

    const schema = pbj.schema();
    const curie = schema.getCurie();
    let method = null;

    if (schema.hasMixin('gdbots:pbjx:mixin:command')) {
      method = 'send';
    } else if (schema.hasMixin('gdbots:pbjx:mixin:request')) {
      method = 'request';
    } else if (schema.hasMixin('gdbots:pbjx:mixin:event')) {
      method = 'publish';
    } else {
      return;
    }

    // if we're publishing and it's frozen already then we assume that the
    // event was injected by another process (websocket for example) and
    // the intention was to dispatch this through redux, not pbjx.
    if (method === 'publish' && pbj.isFrozen()) {
      store.dispatch(fulfillPbjxAction(pbj, method));
      store.dispatch({ ...fulfillPbjxAction(pbj, method), type: curie.toString() });
      return;
    }

    store.dispatch(startPbjxAction(pbj, method));
    store.dispatch({ ...startPbjxAction(pbj, method), type: `${curie}.${STATE_STARTED}` });

    pbjx[method](pbj)
      .then((response = null) => {
        pbj.freeze();

        if (method === 'request') {
          store.dispatch(fulfillPbjxAction(response, method));
          store.dispatch({
            ...fulfillPbjxAction(response, method),
            type: response.schema().getCurie().toString(),
          });
          return;
        }

        const suffix = method === 'publish' ? '' : `.${STATE_FULFILLED}`;
        store.dispatch(fulfillPbjxAction(pbj, method));
        store.dispatch({ ...fulfillPbjxAction(pbj, method), type: `${curie}${suffix}` });
      })
      .catch((e) => {
        pbj.freeze();
        const exception = e instanceof Exception ? e : new LogicException(`${e.message || e}`);
        store.dispatch(rejectPbjxAction(pbj, method, exception));
        store.dispatch({ ...rejectPbjxAction(pbj, method, exception), type: `${curie}.${STATE_REJECTED}` });
      });
  };
}
