import Dispatcher from '../Dispatcher';
import getEventNames from '../utils/getEventNames';
import reduceReducers from './reduceReducers';
import { actionTypes } from '../constants';

const actionsToHandle = {
  [actionTypes.STARTED]: true,
  [actionTypes.REJECTED]: true,
  [actionTypes.FULFILLED]: true,
};

export default function createReducer() {
  const dispatcher = new Dispatcher();
  const reducer = (state = {}, action) => {
    if (!actionsToHandle[action.type]) {
      return state;
    }

    let includeWildcards = false;
    let suffix = `.${action.pbjx.state}`;

    if (action.type === actionTypes.FULFILLED) {
      includeWildcards = action.pbjx.method === 'publish';
      suffix = action.pbjx.method !== 'send' ? '' : suffix;
    }

    const reducers = [];
    getEventNames(action.pbj, suffix, includeWildcards).forEach((eventName) => {
      reducers.push(...dispatcher.getListeners(eventName));
    });

    if (!reducers.length) {
      return state;
    }

    return reduceReducers(...reducers)(state, action.pbj);
  };

  reducer.subscribe = (eventName, listener) => dispatcher.addListener(eventName, listener);
  reducer.unsubscribe = (eventName, listener) => dispatcher.removeListener(eventName, listener);
  return reducer;
}
