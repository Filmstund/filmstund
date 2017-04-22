import { applyMiddleware, createStore, compose } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import throttle from 'lodash/throttle';

import { loadState, saveState } from "./localStorage";

import reducers from "./reducers";

const persistedState = loadState();

const middlewares = applyMiddleware(thunk, logger);

const enhancers = compose(
    middlewares,
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
);

const store = createStore(reducers, persistedState, enhancers);

store.subscribe(throttle(() => {
    saveState(store.getState());
}, 1000));

export default store;