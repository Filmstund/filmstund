import { omit } from "lodash";
import fetch, { jsonRequest } from "../../lib/fetch";
import { USER_SIGNOUT_ACTION } from "./user";
import { requestAndValidate } from "./helper";

const idTransform = f => f;
const appendId = (...pathComponents) => pathComponents.join("/");

const reduceToObject = (array, transform) =>
  array.reduce((acc, elem) => ({ ...acc, [elem.id]: transform(elem) }), {});

const crudReducer = (name, path, transform = idTransform) => {
  const actions = {
    requestIndex: `${name}_REQUEST_INDEX`,
    successIndex: `${name}_RESPONSE_INDEX`,
    errorIndex: `${name}_ERROR_INDEX`,

    requestSingle: `${name}_REQUEST_SINGLE`,
    successSingle: `${name}_RESPONSE_SINGLE`,
    errorSingle: `${name}_ERROR_SINGLE`,

    requestCreate: `${name}_REQUEST_CREATE`,
    successCreate: `${name}_RESPONSE_CREATE`,
    errorCreate: `${name}_ERROR_CREATE`,

    requestUpdate: `${name}_REQUEST_UPDATE`,
    successUpdate: `${name}_RESPONSE_UPDATE`,
    errorUpdate: `${name}_ERROR_UPDATE`,

    requestDelete: `${name}_REQUEST_DELETE`,
    successDelete: `${name}_RESPONSE_DELETE`,
    errorDelete: `${name}_ERROR_DELETE`
  };

  const initialState = {
    loading: false,
    data: {},
    error: null
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case actions.requestIndex:
      case actions.requestSingle:
      case actions.requestCreate:
      case actions.requestUpdate:
      case actions.requestDelete:
        return {
          ...state,
          error: null,
          loading: true
        };
      case actions.successIndex:
        return {
          ...state,
          loading: false,
          error: null,
          data: action.data
        };
      case actions.successSingle:
      case actions.successUpdate:
      case actions.successCreate:
        return {
          ...state,
          loading: false,
          error: null,
          data: {
            ...state.data,
            [action.data.id]: action.data
          }
        };
      case actions.successDelete:
        return {
          ...state,
          loading: false,
          error: null,
          data: omit(state.data, action.id)
        };
      case actions.errorIndex:
      case actions.errorSingle:
      case actions.errorCreate:
      case actions.errorUpdate:
      case actions.errorDelete:
        return {
          ...state,
          loading: false,
          error: action.error
        };
      case USER_SIGNOUT_ACTION:
        return initialState;

      default:
        return state;
    }
  };

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

      requestAndValidate(dispatch, fetch, appendId(path, id))
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
  const actions = {
    requestSingle: `${name}_REQUEST_SINGLE`,
    successSingle: `${name}_RESPONSE_SINGLE`,
    errorSingle: `${name}_ERROR_SINGLE`,

    requestUpdate: `${name}_REQUEST_UPDATE`,
    successUpdate: `${name}_RESPONSE_UPDATE`,
    errorUpdate: `${name}_ERROR_UPDATE`,

    clearSingle: `${name}_CLEAR_SINGLE`
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

      requestAndValidate(dispatch, fetch, path)
        .then(data => dispatch({ type: actions.successSingle, data }))
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
