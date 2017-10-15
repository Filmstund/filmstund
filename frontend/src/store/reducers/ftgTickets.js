import fetch, { jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";
import { USER_SIGNOUT_ACTION } from "./user";
import { requestAndValidate } from "./helper";

const path = withBaseURL("/users/me/ftgtickets");

const actions = {
  requestSingle: `FTG_TICKETS_REQUEST`,
  successSingle: `FTG_TICKETS_RESPONSE`,
  errorSingle: `FTG_TICKETS_ERROR`,

  requestUpdate: `FTG_TICKETS_REQUEST_UPDATE`,
  successUpdate: `FTG_TICKETS_RESPONSE_UPDATE`,
  errorUpdate: `FTG_TICKETS_ERROR_UPDATE`
};

const initialState = {
  loading: false,
  data: [],
  success: null,
  error: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.requestSingle:
    case actions.requestUpdate:
      return {
        ...state,
        error: null,
        success: null,
        loading: true
      };
    case actions.successSingle:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.data
      };
    case actions.successUpdate:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        data: action.data
      };
    case actions.errorSingle:
    case actions.errorUpdate:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.error
      };
    case USER_SIGNOUT_ACTION:
      return initialState;

    default:
      return state;
  }
};

const actionCreators = {
  requestSingle: () => dispatch => {
    dispatch({ type: actions.requestSingle });

    requestAndValidate(dispatch, fetch, path)
      .then(data => {
        dispatch({ type: actions.successSingle, data });
      })
      .catch(error => {
        dispatch({ type: actions.errorSingle, error });
      });
  },

  requestUpdate: data => dispatch => {
    dispatch({ type: actions.requestUpdate, data });

    requestAndValidate(dispatch, jsonRequest, path, data, "PUT")
      .then(data => {
        dispatch({ type: actions.successUpdate, data });
      })
      .catch(error => dispatch({ type: actions.errorUpdate, error }));
  }
};

export default {
  reducer,
  actions: actionCreators
};
