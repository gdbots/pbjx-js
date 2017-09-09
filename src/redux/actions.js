import { actionTypes } from '../constants';

/**
 * Creates an action that is an instruction to call the pbjx service with
 * the provided pbj.  The optional channel allows you to manage concurrent
 * pbjx operations that are bound to different components, sagas, etc.
 *
 * This is NOT required to kick off pbjx, you can simply dispatch the pbj
 * itself, that is equivalent to using this action creator with the default
 * channel value of "root".
 *
 * IMPORTANT - The pbjx middleware intercepts this and runs the pbjx process.
 * This action will never land in a reducer or other middleware.
 *
 * @param {Message} pbj       - A pbj Message instance.
 * @param {string}  [channel] - Allows for concurrent pbjx operations to be dealt
 *                              with differently in sagas, reducers, etc.
 */
export const callPbjx = (pbj, channel = 'root') => ({
  type: actionTypes.CALLED,
  pbj,
  ctx: {
    channel,
  },
});

export default { callPbjx };
