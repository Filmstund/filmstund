import {
  FETCH_SHOWINGS,
  FETCH_SHOWING,
  FETCH_TIME_SLOTS,
  SHOWING_ATTENDEES_CHANGE,
  SHOWING_STATUS_CHANGE,
  WAITING_SUBMIT_SLOTS_PICKED,
  SUBMIT_SLOTS_PICKED
} from '../actions'

const initialState = {
  showingMap: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SHOWINGS:
      return {
        ...state,
        showingMap: action.showings
      };
    case FETCH_SHOWING:
      const { showing } = action

      return {
        ...state,
        showingMap: {
          ...state.showingMap,
          [showing.id]: showing
        }
      }
    case FETCH_TIME_SLOTS:
      return {
        ...state,
        showingMap: {
          ...state.showingMap,
          [action.showingId]: {
            ...state.showingMap[action.showingId],
            time_slots: action.time_slots
          }
        }
      }
    case SHOWING_ATTENDEES_CHANGE:
      const { showingId, attendees } = action
      return {
        ...state,
        showingMap: {
          ...state.showingMap,
          [showingId]: {
            ...state.showingMap[showingId],
            attendees
          }
        }
      }
    case SHOWING_STATUS_CHANGE:
      const { showingId: id, status } = action;
      return {
          ...state,
          showingMap: {
              ...state.showingMap,
            [id]: {
                ...state.showingMap[id],
              status
            }
          }
      }
    default:
      return state
  }
}
