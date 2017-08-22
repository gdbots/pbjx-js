/* eslint-disable no-console, no-unused-vars */
import EnvelopeV1 from '@gdbots/schemas/gdbots/pbjx/EnvelopeV1';
import Message from '@gdbots/pbj/Message';
import { actionTypes } from '../constants';

// const transport = axios.create({
//   baseURL: PBJX_ENDPOINT,
//   timeout: 3000,
//   headers: { 'Content-Type': 'application/json; charset=utf-8' },
// });

/*
the flow of pbjx middleware...
todo: finish pbjx lib, temporarily calling endpoint direct in this middleware

from action creator, saga, etc. dispatch an action with a payload that
is a Message instance (only one), similar to thunk functions.

This is NOT a standard redux action yet as it's not an object with
{ type: 'some_type', ... }
- dispatch(pbj);

The pbjx middleware should be first in line so it can perform the transformations
before anything else gets to it.

what pbjx middleware will do with it (wip):
- skip if not a message (call next middleware)

- dispatch pbjx started "@gdbots/pbjx/STARTED" (a redux action)
  e.g. { type: '@gdbots/pbjx/STARTED', pbj: action }

- trigger lifecycle (pbjx internal, not through redux)
  The reason that lifecycle, and in general pbjx internals, should not dispatch
  through redux is that it would cause too many dispatched actions that
  may cause rerendering unecessarily.
  - "gdbots_pbjx.message.bind/validate/enrich"
  - curie/mixin ids/mixin curie events (just like php lib)

- call the appropriate pbjx method (send, request).
  publish handling needs to be resolved differently since that is after the fact
  and should be addressed in reducers.

- dispatch pbjx completed or error
  e.g. { type: '@gdbots/pbjx/COMPLETED', pbj: action, pbjxPhase: 'completed' }

createPbjxAction(pbj, 'FAILED')
failPbjx

  need to either have pbjx reducer which internally dispatches
  to pbjx subscribers as a single unit of work or each
  reducer must also listen to pbjx action completed and perform
  their own switch (not very clean do repeat that)

tmz:iam:request:search-users-request.requested

pbjxMaybe(pbj);
{ type: 'tmz:iam:request:search-users-request.maybe', pbj }

{ type: 'tmz:iam:request:search-users-response.created', pbj }
saga listens to ^^


@triniti/iam/SEARCH_USERS_REQUESTED
@triniti/iam/SEARCH_USERS_REQUEST_STARTED
@triniti/iam/SEARCH_USERS_REQUEST_FAILED
@triniti/iam/SEARCH_USERS_REQUEST_REJECTED
@triniti/iam/SEARCH_USERS_RESPONSE (this is the "completed" condition of the request - might change this convention)
@triniti/iam/CREATE_USER_REQUESTED
@triniti/iam/CREATE_USER_STARTED
@triniti/iam/CREATE_USER_FAILED
@triniti/iam/CREATE_USER_REJECTED
@triniti/iam/CREATE_USER_SENT

phases:
- requested
- started
- failed
- sent/published/completed
*/

export default function createPbjxAction(pbj, phase = '') {
  return { type: `${actionTypes.PREFIX}${phase}`, pbj, pbjxPhase: phase };
}

/**
 * @param {Pbjx} pbjx
 *
 * @returns {function}
 */
export default function createMiddleware(pbjx) {
  return store => next => (action) => {
    if (!(action instanceof Message)) {
      next(action);
      return;
    }

    const dispatch = store.dispatch;
    const schema = action.schema();
    const curie = schema.getCurie();

    dispatch(createPbjxAction(action, 'started'));

    if (schema.hasMixin('gdbots:pbjx:mixin:command')) {
      pbjx.send(action)
        .then(() => {
          dispatch(createPbjxAction(action, 'completed'));
        })
        .catch((e) => {
          dispatch(createPbjxAction(action, e.name));
        });

      return;
    }

    if (schema.hasMixin('gdbots:pbjx:mixin:request')) {
      pbjx.request(action)
        .then((response) => {
          dispatch(createPbjxAction(response, 'completed'));
        })
        .catch((e) => {
          dispatch(createPbjxAction(action, e.name));
        });

      return;
    }


    //
    // const endpoint = schema.getCurie()
    //   .toString()
    //   .replace('::', ':_:')
    //   .replace(/:/g, '/');
    //
    // const accessToken = localStorage.getItem('tmz:user:access_token');
    //
    // store.dispatch({ type: '@gdbots/pbjx/STARTED', pbj: action });
    // store.dispatch({ type: `${schema.getCurie()}.started`, pbj: action });
    //
    //
    // const transport = {
    //   post: () => {
    //   },
    // };
    // transport.post(endpoint, action.toObject(), {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // }).then(({ data }) => {
    //   try {
    //     const envelope = EnvelopeV1.fromObject(data);
    //     if (envelope.get('ok')) {
    //       const pbj = envelope.get('message') || action;
    //       store.dispatch({ type: '@gdbots/pbjx/COMPLETED', pbj });
    //       store.dispatch({ type: `${pbj.schema().getCurie()}.completed`, pbj });
    //
    //       if (envelope.has('message')) {
    //         // const message = envelope.get('message').freeze();
    //         //
    //         // store.dispatch({
    //         //   type: message.schema().getCurieMajor().toString(),
    //         //   pbj: message,
    //         // });
    //         //
    //         // store.dispatch({
    //         //   type: message.schema().getCurie().toString(),
    //         //   pbj: message,
    //         // });
    //         //
    //         // message.schema().getMixinCuries().forEach((curie) => {
    //         //   store.dispatch({
    //         //     type: curie,
    //         //     pbj: message,
    //         //   });
    //         // });
    //       }
    //
    //       return;
    //     }
    //
    //     store.dispatch({ type: '@gdbots/pbjx/REJECTED', error: envelope });
    //     store.dispatch({ type: `${schema.getCurie()}.rejected`, error: envelope });
    //   } catch (e) {
    //     store.dispatch({ type: '@gdbots/pbjx/ERROR', error: JSON.stringify(data) });
    //     store.dispatch({ type: `${schema.getCurie()}.error`, error: JSON.stringify(data) });
    //   }
    // }).catch((err) => {
    //   store.dispatch({ type: '@gdbots/pbjx/ERROR', error: err });
    //   store.dispatch({ type: `${schema.getCurie()}.error`, error: err });
    // });
  };
}
