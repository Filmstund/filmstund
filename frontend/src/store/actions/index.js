export const WAITING_SIGN_OUT = 'WAITING_SIGN_OUT'
export const SIGN_OUT = 'SIGN_OUT'

export const WAITING_SIGN_IN = 'WAITING_SIGN_IN'
export const SIGN_IN_FAILED = 'SIGN_IN_FAILED'
export const SIGN_IN = 'SIGN_IN'

import { fetchEndpoint, postEndpoint } from '../../service/backend'

export const signIn = (authData) => (dispatch) => {
  dispatch({ type: WAITING_SIGN_IN })

  postEndpoint('/authenticate', authData).then(data => {
    dispatch({ type: SIGN_IN, data })
  }).catch(err => {
    console.error("Error during sign in", err);
    dispatch({ type: SIGN_IN_FAILED })
  })
}

export const signOut = () => (dispatch) => {
  dispatch({ type: WAITING_SIGN_OUT })

  fetchEndpoint('/signout').catch(err => {
    console.error("Error during sign out", err);
  }).then(() => {
    dispatch({
      type: SIGN_OUT
    })
  })
}
