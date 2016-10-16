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
export const SHOWING_ATTENDEES_CHANGE = 'SHOWING_ATTENDEES_CHANGE'
export const SHOWING_STATUS_CHANGE = 'SHOWING_STATUS_CHANGE'

export const SUBMIT_SLOTS_PICKED = 'SUBMIT_SLOTS_PICKED'
export const WAITING_SUBMIT_SLOTS_PICKED = 'WAITING_SUBMIT_SLOTS_PICKED'

export const WAITING_SLOT_PICKED = 'WAITING_SLOT_PICKED'

import { fetchEndpoint, postEndpoint, putEndpoint } from '../../service/backend'

export const signIn = (authData) => (dispatch) => {
  dispatch({ type: WAITING_SIGN_IN })

  postEndpoint('/authenticate', authData).then(data => {
    dispatch({ type: SIGN_IN, ...data })
    browserHistory.push(`/showings`);
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
      type: SHOWING_ATTENDEES_CHANGE,
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
    console.log(`Error during time_slots(${id}) fetch` );
    throw err;
  })
}

export const postShowingOrdered = (id) => (dispatch) => {
  postEndpoint(`/showings/${id}/order`).then(() => {

    dispatch({
      type: SHOWING_STATUS_CHANGE,
      showingId: id,
      status: "ordered"
    })
  }).catch(err => {
    console.error(`Error during post status change(${id}, ${status})`, err);
  })
};

export const postShowingDone = (id) => (dispatch) => {
  postEndpoint(`/showings/${id}/done`).then(() => {

    dispatch({
      type: SHOWING_STATUS_CHANGE,
      showingId: id,
      status: "done"
    })
  }).catch(err => {
    console.error(`Error during post status change(${id}, ${status})`, err);
  })
};

export const submitSlotsPickedForShowing = (id, slotIds) => (dispatch) => {
  dispatch({
    type: WAITING_SUBMIT_SLOTS_PICKED
  });

  postEndpoint(`/showings/${id}/time_slots/votes`, {
    ids: slotIds
  }).then(data => {

    dispatch({
      type: FETCH_TIME_SLOTS,
      showingId: id,
      time_slots: data.time_slots
    })
  }).catch(err => {
    err.json().then((x) => {
      console.log(x);
    })
  });
};

export const submitTimeSlotForShowing = (showing_id, slot_id) => (dispatch) => {
  dispatch({
    type: WAITING_SLOT_PICKED
  });

  postEndpoint(`/showings/${showing_id}/complete`, {
    slot_id
  }).then(({showing}) => {
    dispatch({
      type: FETCH_SHOWING,
      showing
    })
  }).catch(err => {
    console.error('Error, could not submit time slot for showing');
    throw err;
  });
} ;
