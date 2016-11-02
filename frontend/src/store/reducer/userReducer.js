import {
  SIGN_OUT,
  SIGN_IN_FAILED,
  SIGN_IN,
  UPDATE_ME,
  UPDATE_CARD_FOR_USER,
  REMOVE_CARD_FROM_USER,
  FETCH_GIFT_CARDS
} from '../actions'

const initialState = { cards: [] }

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CARD_FOR_USER:
      return {
          ...state,
        cards: [...state.cards, action.card]

      }
    case REMOVE_CARD_FROM_USER:
      return {
          ...state,
        cards: state.cards.filter(c => c.id != action.cardId)
      }
    case UPDATE_ME:
    case SIGN_IN:
      return {
        ...action.user,
        cards: []
    }
    case SIGN_IN_FAILED:
    case SIGN_OUT:
      return initialState
    case FETCH_GIFT_CARDS:
      return {
          ...state,
          cards: action.giftCards
      };
    default:
      return state
  }
}