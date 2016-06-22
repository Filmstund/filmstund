import {
  SIGN_OUT,
  SIGN_IN_FAILED,
  SIGN_IN,
} from '../actions'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return action.data.user
    case SIGN_IN_FAILED:
    case SIGN_OUT:
      return initialState
    default:
      return state
  }
}