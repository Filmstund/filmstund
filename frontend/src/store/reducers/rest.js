import { combineReducers } from "redux";
import fetch, { jsonRequest } from "../../lib/fetch";
import { USER_SIGNOUT_ACTION } from "./user";
import {
  requestAndValidate,
  mergeIntoCollection,
  removeFromCollection
} from "./helper";

const idTransform = f => f;
const appendId = (...pathComponents) => pathComponents.join("/");

const reduceToObject = (array, transform) =>
  array.reduce((acc, elem) => ({ ...acc, [elem.id]: transform(elem) }), {});

const crudReducer = (name, path, transform = idTransform) => {
  const upperName = name.toUpperCase();
  const actions = {
    requestIndex: `${upperName}_REQUEST_INDEX`,
    successIndex: `${upperName}_RESPONSE_INDEX`,
    errorIndex: `${upperName}_ERROR_INDEX`,

    requestSingle: `${upperName}_REQUEST_SINGLE`,
    successSingle: `${upperName}_RESPONSE_SINGLE`,
    errorSingle: `${upperName}_ERROR_SINGLE`,

    requestCreate: `${upperName}_REQUEST_CREATE`,
    successCreate: `${upperName}_RESPONSE_CREATE`,
    errorCreate: `${upperName}_ERROR_CREATE`,

    requestUpdate: `${upperName}_REQUEST_UPDATE`,
    successUpdate: `${upperName}_RESPONSE_UPDATE`,
    errorUpdate: `${upperName}_ERROR_UPDATE`,

    requestDelete: `${upperName}_REQUEST_DELETE`,
    successDelete: `${upperName}_RESPONSE_DELETE`,
    errorDelete: `${upperName}_ERROR_DELETE`
  };

  const loadingReducer = (state = {}, action) => {
    switch (action.type) {
      case actions.requestIndex:
        return { ...state, index: true };
      case actions.successIndex:
        return { ...state, index: false };
      case actions.requestSingle:
      case actions.requestCreate:
      case actions.requestUpdate:
      case actions.requestDelete:
        return { ...state, [action.id]: true };
      case actions.successSingle:
      case actions.successUpdate:
      case actions.successCreate:
      case actions.errorIndex:
      case actions.errorSingle:
      case actions.errorCreate:
      case actions.errorUpdate:
      case actions.errorDelete:
        return { ...state, [action.id]: false };
      case actions.successDelete:
        return removeFromCollection(state, action.id);
      case USER_SIGNOUT_ACTION:
        return {};
      default:
        return state;
    }
  };

  const errorReducer = (state = null, action) => {
    switch (action.type) {
      case actions.requestIndex:
      case actions.requestSingle:
      case actions.requestCreate:
      case actions.requestUpdate:
      case actions.requestDelete:
      case actions.successIndex:
      case actions.successSingle:
      case actions.successUpdate:
      case actions.successCreate:
        return null;
      case actions.errorIndex:
      case actions.errorSingle:
      case actions.errorCreate:
      case actions.errorUpdate:
      case actions.errorDelete:
        return action.error;
      case USER_SIGNOUT_ACTION:
        return null;
      default:
        return state;
    }
  };

  const dataReducer = (state = {}, action) => {
    switch (action.type) {
      case actions.successIndex:
        return action.data;
      case actions.successSingle:
      case actions.successUpdate:
      case actions.successCreate:
        return mergeIntoCollection(state, action.data);
      case actions.successDelete:
        return removeFromCollection(state, action.id);
      case USER_SIGNOUT_ACTION:
        return {};

      default:
        return state;
    }
  };

  const reducer = combineReducers({
    data: dataReducer,
    error: errorReducer,
    loading: loadingReducer
  });

  const actionCreators = {
    requestIndex: () => dispatch => {
      dispatch({ type: actions.requestIndex });

      requestAndValidate(dispatch, fetch, path)
        .then(data =>
          dispatch({
            type: actions.successIndex,
            data: reduceToObject(data, transform)
          })
        )
        .catch(error => dispatch({ type: actions.errorIndex, error }));
    },

    requestSingle: id => dispatch => {
      dispatch({ type: actions.requestSingle, id });

      return requestAndValidate(dispatch, fetch, appendId(path, id))
        .then(data => {
          dispatch({ type: actions.successSingle, data: transform(data) });
          return data;
        })
        .catch(error => dispatch({ type: actions.errorSingle, error }));
    },

    requestCreate: data => dispatch => {
      dispatch({ type: actions.requestCreate, data });

      requestAndValidate(dispatch, jsonRequest, path, data)
        .then(data =>
          dispatch({ type: actions.successCreate, data: transform(data) })
        )
        .catch(error => dispatch({ type: actions.errorCreate, error }));
    },

    requestUpdate: data => dispatch => {
      dispatch({ type: actions.requestUpdate, data });

      requestAndValidate(
        dispatch,
        jsonRequest,
        appendId(path, data.id),
        data,
        "PUT"
      )
        .then(data =>
          dispatch({ type: actions.successUpdate, data: transform(data) })
        )
        .catch(error => dispatch({ type: actions.errorUpdate, error }));
    },

    requestDelete: id => dispatch => {
      dispatch({ type: actions.requestDelete, id });

      requestAndValidate(
        dispatch,
        jsonRequest,
        appendId(path, id),
        {},
        "DELETE"
      )
        .then(id => dispatch({ type: actions.successDelete, id }))
        .catch(error => dispatch({ type: actions.errorDelete, error }));
    }
  };

  return {
    reducer,
    _actions: actions,
    actions: actionCreators
  };
};

export const crudSingleReducer = (name, path, transform = idTransform) => {
  const upperName = name.toUpperCase();
  const actions = {
    requestSingle: `${upperName}_REQUEST_SINGLE`,
    successSingle: `${upperName}_RESPONSE_SINGLE`,
    errorSingle: `${upperName}_ERROR_SINGLE`,

    requestUpdate: `${upperName}_REQUEST_UPDATE`,
    successUpdate: `${upperName}_RESPONSE_UPDATE`,
    errorUpdate: `${upperName}_ERROR_UPDATE`,

    clearSingle: `${upperName}_CLEAR_SINGLE`
  };

  const initialState = {
    loading: false,
    data: {},
    error: null
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.requestSingle:
      case actions.requestUpdate:
        return {
          ...state,
          error: null,
          loading: true
        };
      case actions.successSingle:
      case actions.successUpdate:
        return {
          ...state,
          loading: false,
          error: null,
          data: action.data
        };
      case actions.errorSingle:
      case actions.errorUpdate:
        return {
          ...state,
          loading: false,
          error: action.error
        };

      case USER_SIGNOUT_ACTION:
      case actions.clearSingle:
        return initialState;
      default:
        return state;
    }
  };

  const actionCreators = {
    requestSingle: () => dispatch => {
      dispatch({ type: actions.requestSingle });

      return requestAndValidate(dispatch, fetch, path)
        .then(data => {
          dispatch({ type: actions.successSingle, data });
          return data;
        })
        .catch(error => dispatch({ type: actions.errorSingle, error }));
    },

    requestUpdate: data => dispatch => {
      dispatch({ type: actions.requestUpdate, data });

      requestAndValidate(dispatch, jsonRequest, path, data, "PUT")
        .then(data => dispatch({ type: actions.successUpdate, data }))
        .catch(error => dispatch({ type: actions.errorUpdate, error }));
    },

    clearSingle: () => ({ type: actions.clearSingle })
  };

  return {
    reducer,
    _actions: actions,
    actions: actionCreators
  };
};

export default crudReducer;
