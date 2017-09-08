import fetch, { jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";
import { USER_SIGNOUT_ACTION } from "./user";
import { requestAndValidate } from "./helper";

const path = withBaseURL("/users/me");

const actions = {
  requestSingle: `ME_REQUEST_SINGLE`,
  successSingle: `ME_RESPONSE_SINGLE`,
  errorSingle: `ME_ERROR_SINGLE`,

  requestUpdate: `ME_REQUEST_UPDATE`,
  successUpdate: `ME_RESPONSE_UPDATE`,
  errorUpdate: `ME_ERROR_UPDATE`,

  clearStatus: `ME_CLEAR_STATUS`,
  clearSingle: `ME_CLEAR_SINGLE`
};

const initialState = {
  loading: false,
  data: {},
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
    case actions.clearStatus:
      return {
        ...state,
        success: null,
        error: null
      };

    case USER_SIGNOUT_ACTION:
    case actions.clearSingle:
      return initialState;
    default:
      return state;
  }
};

const actionCreators = {
  requestSingle: () => (dispatch, getState) => {
    const state = getState();
    if (state.me.loading) {
      return Promise.resolve();
    }

    dispatch({ type: actions.requestSingle });

    requestAndValidate(dispatch, fetch, path)
      .then(data => {
        dispatch({ type: actions.successSingle, data });
        dispatch({ type: "USERS_RESPONSE_SINGLE", data });
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
        dispatch({ type: "USERS_UPDATE_SINGLE", data });
        setTimeout(() => dispatch(actionCreators.clearStatus()), 5500);
      })
      .catch(error => dispatch({ type: actions.errorUpdate, error }));
  },

  clearStatus: () => ({ type: actions.clearStatus }),

  clearSingle: () => ({ type: actions.clearSingle })
};

export default {
  reducer,
  actions: actionCreators
};
