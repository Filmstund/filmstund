import { push } from "react-router-redux";
export const USER_SIGNOUT_ACTION = "USER_SIGNOUT_ACTION";

export const signoutUser = () => (dispatch, getState) => {
  const state = getState();
  const { pathname, search } = state.router.location;
  const returnUrl = pathname + search;

  dispatch({ type: USER_SIGNOUT_ACTION });

  if (returnUrl.indexOf("/login") !== 0) {
    dispatch(push(`/login?return_to=${encodeURIComponent(returnUrl)}`));
  }
};
