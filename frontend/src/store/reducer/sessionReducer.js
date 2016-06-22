import {
  SIGN_OUT,
  SIGN_IN_FAILED,
  SIGN_IN,
} from '../actions'

const initialState = {
  signedIn: false,
  authToken: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return {
        ...state,
        signedIn: true,
        authToken: action.data.token
      }
    case SIGN_IN_FAILED:
    case SIGN_OUT:
      return initialState
    default:
      return state
  }
}

export const getAuthTokenFromSession = (state) => state.authToken