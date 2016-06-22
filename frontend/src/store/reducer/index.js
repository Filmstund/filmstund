import { combineReducers } from 'redux';
import session, { getAuthTokenFromSession } from './sessionReducer';
import user from './userReducer';

export default combineReducers({
  user,
  session
})

export const getSession = (state) => state.session
export const getUser = (state) => state.user

export const getAuthToken = (state) => getAuthTokenFromSession(getSession(state))