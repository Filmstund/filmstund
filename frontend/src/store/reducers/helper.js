import { signoutUser } from "./user";

export const requestAndValidate = (dispatch, fetchish, ...args) =>
  fetchish(...args).catch(resp => {
    if (resp.status === 403) {
      dispatch(signoutUser());
    }
    return Promise.reject(resp);
  });
