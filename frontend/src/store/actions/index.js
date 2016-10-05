import { browserHistory } from 'react-router'

export const WAITING_SIGN_OUT = 'WAITING_SIGN_OUT'
export const SIGN_OUT = 'SIGN_OUT'

export const WAITING_SIGN_IN = 'WAITING_SIGN_IN'
export const SIGN_IN_FAILED = 'SIGN_IN_FAILED'
export const SIGN_IN = 'SIGN_IN'

export const WAITING_UPDATE_ME = 'WAITING_UPDATE_ME'
export const UPDATE_ME = 'UPDATE_ME'

export const FETCH_SHOWINGS = 'FETCH_SHOWINGS'
export const FETCH_SHOWING = 'FETCH_SHOWING'
export const FETCH_TIME_SLOTS = 'FETCH_TIME_SLOTS'
export const SHOWING_STATUS_CHANGE = 'SHOWING_STATUS_CHANGE'

import { fetchEndpoint, postEndpoint, putEndpoint } from '../../service/backend'

export const signIn = (authData) => (dispatch) => {
  dispatch({ type: WAITING_SIGN_IN })

  postEndpoint('/authenticate', authData).then(data => {
    dispatch({ type: SIGN_IN, ...data })
  }).catch(err => {
    console.error("Error during sign in", err);
    dispatch({ type: SIGN_IN_FAILED })
  })
}

export const signOut = () => (dispatch) => {
  browserHistory.push('/')
  dispatch({ type: WAITING_SIGN_OUT })

  fetchEndpoint('/signout').catch(err => {
    console.error("Error during sign out", err);
  }).then(() => {
    dispatch({
      type: SIGN_OUT
    })
  })
}

export const updateUser = (user) => (dispatch) => {
  dispatch({
    type: WAITING_UPDATE_ME
  })
  putEndpoint('/me', { user }).then((user) => {
    dispatch({
      type: UPDATE_ME,
      user
    })
  }).catch(err => {
    console.error("Error during user update", err);
  })
}

export const fetchShowings = () => (dispatch) => {
  fetchEndpoint('/showings').then(({ showings }) => {

    let showingsObj = showings.reduce((acc, showing) => {
      acc[showing.id] = showing
      return acc
    }, {})

    dispatch({
      type: FETCH_SHOWINGS,
      showings: showingsObj
    })
  }).catch(err => {
    console.error("Error during showings fetch", err);
  })
}

export const fetchShowing = (id) => (dispatch) => {
  fetchEndpoint(`/showings/${id}`).then(({showing}) => {

    dispatch({
      type: FETCH_SHOWING,
      showing
    })
  }).catch(err => {
    console.error(`Error during showing(${id}) fetch`, err);
  })
}

export const postAttendStatusChange = (id, status) => (dispatch) => {
  postEndpoint(`/showings/${id}/${status}`).then(({ attendees }) => {

    dispatch({
      type: SHOWING_STATUS_CHANGE,
      showingId: id,
      attendees
    })
  }).catch(err => {
    console.error(`Error during post status change(${id}, ${status})`, err);
  })
}

export const fetchTimeSlotsForShowing = (id) => (dispatch) => {
  fetchEndpoint(`/showings/${id}/time_slots/votes`).then(({ time_slots }) => {

    dispatch({
      type: FETCH_TIME_SLOTS,
      showingId: id,
      time_slots
    })
  }).catch(err => {
    console.error(`Error during time_slots(${id}) fetch`, err);
  })
}


