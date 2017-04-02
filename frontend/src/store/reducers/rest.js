import _ from "lodash";
import fetch from "../../lib/fetch";


const reduceToObject = (array) => array.reduce(
    (acc, elem) => ({ ...acc, [elem.id]: elem}),
    {}
);

const crudReducer = (name, path) => {
    const actions = {
        requestIndex: Symbol(`${name}_REQUEST_INDEX`),
        successIndex: Symbol(`${name}_RESPONSE_INDEX`),
        errorIndex: Symbol(`${name}_ERROR_INDEX`),

        requestSingle: Symbol(`${name}_REQUEST_SINGLE`),
        successSingle: Symbol(`${name}_RESPONSE_SINGLE`),
        errorSingle: Symbol(`${name}_ERROR_SINGLE`),

        requestCreate: Symbol(`${name}_REQUEST_CREATE`),
        successCreate: Symbol(`${name}_RESPONSE_CREATE`),
        errorCreate: Symbol(`${name}_ERROR_CREATE`),

        requestUpdate: Symbol(`${name}_REQUEST_UPDATE`),
        successUpdate: Symbol(`${name}_RESPONSE_UPDATE`),
        errorUpdate: Symbol(`${name}_ERROR_UPDATE`),

        requestDelete: Symbol(`${name}_REQUEST_DELETE`),
        successDelete: Symbol(`${name}_RESPONSE_DELETE`),
        errorDelete: Symbol(`${name}_ERROR_DELETE`),
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
                .then(data => dispatch({ type: actions.successIndex, data: reduceToObject(data) }))
                .catch(error => dispatch({ type: actions.errorIndex, error }))
        },

        requestSingle: (id) => (dispatch) => {
            dispatch({ type: actions.requestSingle });

            fetch(path + "/" + id)
                .then(data => dispatch({ type: actions.successSingle, data }))
                .catch(error => dispatch({ type: actions.errorSingle, error }))
        },

        requestCreate: (data) => (dispatch) => {
            dispatch({ type: actions.requestCreate });

            jsonRequest(path, data)
                .then(data => dispatch({ type: actions.successCreate, data }))
                .catch(error => dispatch({ type: actions.errorCreate, error }))
        },

        requestUpdate: (data) => (dispatch) => {
            dispatch({ type: actions.requestUpdate });

            jsonRequest(path + "/" + data.id, data, "PUT")
                .then(data => dispatch({ type: actions.successUpdate, data }))
                .catch(error => dispatch({ type: actions.errorUpdate, error }))
        },

        requestDelete: (id) => (dispatch) => {
            dispatch({type: actions.requestDelete, id});

            jsonRequest(path + "/" + id, {}, "DELETE")
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