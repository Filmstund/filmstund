import { push } from "react-router-redux";

export const USER_SIGNOUT_ACTION = "USER_SIGNOUT_ACTION";

export const signoutUser = () => dispatch => {
  dispatch({ type: USER_SIGNOUT_ACTION });
};
