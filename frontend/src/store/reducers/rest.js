import _ from "lodash";
import fetch from "../../lib/fetch";

const idTransform = f => f;
const appendId = (...pathComponents) => pathComponents.join('/');

const reduceToObject = (array, transform) => array.reduce(
    (acc, elem) => ({ ...acc, [elem.id]: transform(elem) }),
    {}
);

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
        errorDelete: `${name}_ERROR_DELETE`,
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
                    data: _.omit(state.data, action.id)
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

            default:
                return state;
        }
    };

    const jsonRequest = (path, data, method = "POST") =>
        fetch(path, {
            method,
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });

    const actionCreators = {
        requestIndex: () => (dispatch) => {
            dispatch({ type: actions.requestIndex });

            fetch(path)
                .then(data => dispatch({ type: actions.successIndex, data: reduceToObject(data, transform) }))
                .catch(error => dispatch({ type: actions.errorIndex, error }))
        },

        requestSingle: (id) => (dispatch) => {
            dispatch({ type: actions.requestSingle, id });

            fetch(appendId(path, id))
                .then(data => dispatch({ type: actions.successSingle, data: transform(data) }))
                .catch(error => dispatch({ type: actions.errorSingle, error }))
        },

        requestCreate: (data) => (dispatch) => {
            dispatch({ type: actions.requestCreate, data });

            jsonRequest(path, data)
                .then(data => dispatch({ type: actions.successCreate, data: transform(data) }))
                .catch(error => dispatch({ type: actions.errorCreate, error }))
        },

        requestUpdate: (data) => (dispatch) => {
            dispatch({ type: actions.requestUpdate, data });

            jsonRequest(appendId(path, data.id), data, "PUT")
                .then(data => dispatch({ type: actions.successUpdate, data: transform(data) }))
                .catch(error => dispatch({ type: actions.errorUpdate, error }))
        },

        requestDelete: (id) => (dispatch) => {
            dispatch({ type: actions.requestDelete, id });

            jsonRequest(appendId(path, id), {}, "DELETE")
                .then(id => dispatch({ type: actions.successDelete, id }))
                .catch(error => dispatch({ type: actions.errorDelete, error }))
        }
    };

    return {
        reducer,
        actions: actionCreators
    };
};

export default crudReducer;