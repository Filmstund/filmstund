import {
  SIGN_OUT,
  SIGN_IN_FAILED,
  SIGN_IN,
  UPDATE_ME,
} from '../actions'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ME:
    case SIGN_IN:
      return action.user
    case SIGN_IN_FAILED:
    case SIGN_OUT:
      return initialState
    default:
      return state
  }
}