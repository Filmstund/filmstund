import _ from "lodash";
import fetch, { jsonRequest } from "../../lib/fetch";
import {withBaseURL} from "../../lib/fetch";
import {USER_SIGNOUT_ACTION, signoutUser} from "./user";

const path = withBaseURL("/users/me")

const actions = {
    requestSingle: `ME_REQUEST_SINGLE`,
    successSingle: `ME_RESPONSE_SINGLE`,
    errorSingle: `ME_ERROR_SINGLE`,

    requestUpdate: `ME_REQUEST_UPDATE`,
    successUpdate: `ME_RESPONSE_UPDATE`,
    errorUpdate: `ME_ERROR_UPDATE`,

    clearSingle: `ME_CLEAR_SINGLE`,
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

    requestSingle: () => (dispatch) => {
        dispatch({ type: actions.requestSingle });

        fetch(path)
            .then(data => {
              dispatch({ type: actions.successSingle, data })
              dispatch({ type: 'USERS_RESPONSE_SINGLE', data })
            })
            .catch(error => {
                dispatch({ type: actions.errorSingle, error })
                if (error.status === 403) {
                    dispatch(signoutUser())
                }
            })
    },

    requestUpdate: (data) => (dispatch) => {
        dispatch({ type: actions.requestUpdate, data });

        jsonRequest(path, data, "PUT")
            .then(data => dispatch({ type: actions.successUpdate, data }))
            .catch(error => dispatch({ type: actions.errorUpdate, error }))
    },

    clearSingle: () => ({ type: actions.clearSingle })
};

export default {
    reducer,
    actions: actionCreators
};