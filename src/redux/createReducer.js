import Dispatcher from '../Dispatcher';
import getEventNames from '../utils/getEventNames';
import reduceReducers from './reduceReducers';

export default function createReducer() {
  const dispatcher = new Dispatcher();
  const subscribe = (eventName, listener) => dispatcher.addListener(eventName, listener);
  const unsubscribe = (eventName, listener) => dispatcher.removeListener(eventName, listener);
  const reducer = (state = {}, action) => {
    // fixme: also publish the lifecycle events to reducers (sans wildcards)
    if (!action.pbj) {
      return state;
    }

    const message = action.pbj;
    const reducers = [];

    getEventNames(message, '', true).map(eventName => reducers.push(...dispatcher.getListeners(eventName)));
    if (!reducers) {
      return state;
    }

    return reduceReducers(...reducers)(state, message);
  };

  return {
    subscribe,
    unsubscribe,
    reducer,
  };
}
