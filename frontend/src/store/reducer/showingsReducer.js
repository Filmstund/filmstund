import {
  FETCH_SHOWINGS
} from '../actions'

const initialState = {
  showings: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SHOWINGS:
      return {
        ...state,
        showings: action.showings
      }
    default:
      return state
  }
}
