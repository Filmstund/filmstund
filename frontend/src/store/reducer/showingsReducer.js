import {
  FETCH_SHOWINGS,
  FETCH_SHOWING,
  FETCH_TIME_SLOTS,
  SHOWING_STATUS_CHANGE
} from '../actions'

const initialState = {
  showings: {},
  time_slots: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SHOWINGS:
      return {
        ...state,
        showings: action.showings
      }
    case FETCH_SHOWING:
      const { showing } = action

      return {
        ...state,
        showings: {
          ...state.showings,
          [showing.id]: showing
        }
      }
    case FETCH_TIME_SLOTS:
      return {
        ...state,
        time_slots: {
          ...state.time_slots,
          [action.showingId]: action.time_slots
        }
      }
    case SHOWING_STATUS_CHANGE:
      const { showingId, attendees } = action
      return {
        ...state,
        showings: {
          ...state.showings,
          [showingId]: {
            ...state.showings[showingId],
            attendees
          }
        }
      }
    default:
      return state
  }
}
