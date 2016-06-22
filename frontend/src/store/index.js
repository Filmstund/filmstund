import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { loadState, saveState } from '../service/localStorage'
import rootReducer from './reducer';
import throttle from 'lodash/throttle';

const persistedState = loadState();

const store = createStore(
  rootReducer,
  persistedState,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

export default store;