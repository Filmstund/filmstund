import { omit } from "lodash";
import { push } from "react-router-redux";
import fetch, { jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";
import { USER_SIGNOUT_ACTION } from "./user";
import { requestAndValidate } from "./helper";

const path = withBaseURL("/showings");

const appendId = (...pathComponents) => pathComponents.join("/");

const transform = showing => ({
  ...omit(showing, "time"),
  date: `${showing.date} ${showing.time}`
});

const reduceToObject = (array, transform) =>
  array.reduce((acc, elem) => ({ ...acc, [elem.id]: transform(elem) }), {});

const actions = {
  requestIndex: `SHOWINGS_REQUEST_INDEX`,
  successIndex: `SHOWINGS_RESPONSE_INDEX`,
  errorIndex: `SHOWINGS_ERROR_INDEX`,

  requestSingle: `SHOWINGS_REQUEST_SINGLE`,
  successSingle: `SHOWINGS_RESPONSE_SINGLE`,
  errorSingle: `SHOWINGS_ERROR_SINGLE`,

  requestAttend: `SHOWINGS_REQUEST_ATTEND`,
  successAttend: `SHOWINGS_RESPONSE_ATTEND`,
  errorAttend: `SHOWINGS_ERROR_ATTEND`,

  requestUnattend: `SHOWINGS_REQUEST_UNATTEND`,
  successUnattend: `SHOWINGS_RESPONSE_UNATTEND`,
  errorUnattend: `SHOWINGS_ERROR_UNATTEND`,

  requestCreate: `SHOWINGS_REQUEST_CREATE`,
  successCreate: `SHOWINGS_RESPONSE_CREATE`,
  errorCreate: `SHOWINGS_ERROR_CREATE`,

  requestUpdate: `SHOWINGS_REQUEST_UPDATE`,
  successUpdate: `SHOWINGS_RESPONSE_UPDATE`,
  errorUpdate: `SHOWINGS_ERROR_UPDATE`,

  requestDelete: `SHOWINGS_REQUEST_DELETE`,
  successDelete: `SHOWINGS_RESPONSE_DELETE`,
  errorDelete: `SHOWINGS_ERROR_DELETE`
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
      return {
        ...state,
        loading: false,
        error: null,
        data: {
          ...state.data,
          [action.data.id]: action.data
        }
      };
    case actions.successAttend:
    case actions.successUnattend:
      return {
        ...state,
        loading: false,
        error: null,
        data: {
          ...state.data,
          [action.id]: {
            ...state.data[action.id],
            participants: action.participants
          }
        }
      };
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
    case actions.errorAttend:
    case actions.errorUnattend:
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
      .then(data =>
        dispatch({ type: actions.successSingle, data: transform(data) })
      )
      .catch(error => dispatch({ type: actions.errorSingle, error }));
  },

  requestCreate: data => dispatch => {
    dispatch({ type: actions.requestCreate, data });

    requestAndValidate(dispatch, jsonRequest, path, data)
      .then(data => {
        dispatch({ type: actions.successCreate, data: transform(data) });
        dispatch(push("/showings/" + data.id));
      })
      .catch(error => dispatch({ type: actions.errorCreate, error }));
  },

  requestAttend: id => dispatch => {
    dispatch({ type: actions.requestAttend, id });

    requestAndValidate(dispatch, jsonRequest, appendId(path, id, "attend"))
      .then(participants =>
        dispatch({ type: actions.successAttend, id, participants })
      )
      .catch(error => dispatch({ type: actions.errorAttend, error }));
  },

  requestUnattend: id => dispatch => {
    dispatch({ type: actions.requestUnattend, id });

    requestAndValidate(dispatch, jsonRequest, appendId(path, id, "unattend"))
      .then(participants =>
        dispatch({ type: actions.successUnattend, id, participants })
      )
      .catch(error => dispatch({ type: actions.errorUnattend, error }));
  },

  requestUpdate: data => dispatch => {
    dispatch({ type: actions.requestUpdate, data });

    return requestAndValidate(
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

    requestAndValidate(dispatch, jsonRequest, appendId(path, id), {}, "DELETE")
      .then(id => {
        dispatch({ type: actions.successDelete, id });
        dispatch(push("/"));
      })
      .catch(error => dispatch({ type: actions.errorDelete, error }));
  }
};

export default {
  reducer,
  actions: actionCreators
};
