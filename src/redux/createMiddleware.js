import Exception from '@gdbots/common/Exception';
import Code from '@gdbots/schemas/gdbots/pbjx/enums/Code';
import Message from '@gdbots/pbj/Message';
import LogicException from '../exceptions/LogicException';
import { actionTypes, STATE_FULFILLED, STATE_REJECTED, STATE_STARTED } from '../constants';
import PbjxEvent from '../events/PbjxEvent';

const startPbjx = (pbj, channel, method) => ({
  type: actionTypes.STARTED,
  pbj,
  ctx: {
    channel,
    method,
    state: STATE_STARTED,
  },
});

const rejectPbjx = (pbj, channel, method, exception) => ({
  type: actionTypes.REJECTED,
  pbj,
  ctx: {
    channel,
    method,
    state: STATE_REJECTED,
    code: exception.getCode() || Code.UNKNOWN.getValue(),
    exception,
  },
});

const fulfillPbjx = (pbj, channel, method) => ({
  type: actionTypes.FULFILLED,
  pbj,
  ctx: {
    channel,
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
  return store => next => (action) => {
    let pbj;
    let channel = 'root';

    if (action instanceof Message) {
      pbj = action;
    } else if (action.type === actionTypes.CALLED) {
      pbj = action.pbj;
      channel = action.ctx.channel || channel;
    } else {
      return next(action);
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
      return Promise.resolve(action);
    }

    // if we're publishing and it's frozen already then we assume that the
    // event was injected by another process (websocket for example) and
    // the intention was to dispatch this through redux, not pbjx.
    if (method === 'publish' && pbj.isFrozen()) {
      store.dispatch(fulfillPbjx(pbj, channel, method));
      return Promise.resolve(
        store.dispatch({ ...fulfillPbjx(pbj, channel, method), type: curie.toString() }),
      );
    }

    store.dispatch(startPbjx(pbj, channel, method));
    store.dispatch({ ...startPbjx(pbj, channel, method), type: `${curie}.${STATE_STARTED}` });

    return pbjx[method](pbj).then(
      (response = null) => {
        pbj.freeze();

        if (method === 'request') {
          store.dispatch(fulfillPbjx(response, channel, method));
          return store.dispatch({
            ...fulfillPbjx(response, channel, method),
            type: response.schema().getCurie().toString(),
          });
        }

        const suffix = method === 'publish' ? '' : `.${STATE_FULFILLED}`;
        store.dispatch(fulfillPbjx(pbj, channel, method));
        return store.dispatch({ ...fulfillPbjx(pbj, channel, method), type: `${curie}${suffix}` });
      },
      (e) => {
        pbj.freeze();
        const exception = e instanceof Exception ? e : new LogicException(`${e.message || e}`);
        store.dispatch(rejectPbjx(pbj, channel, method, exception));
        store.dispatch({ ...rejectPbjx(pbj, channel, method, exception), type: `${curie}.${STATE_REJECTED}` });
        return Promise.reject(exception);
      },
    );
  };
}
