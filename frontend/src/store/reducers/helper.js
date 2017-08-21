import { omit } from "lodash";
import { signoutUser } from "./user";

export const requestAndValidate = (dispatch, fetchish, ...args) =>
  fetchish(...args).catch(resp => {
    if (resp.status === 403) {
      dispatch(signoutUser());
    }
    return Promise.reject(resp);
  });

export const mergeIntoCollection = (collection, object) => ({
  ...collection,
  [object.id]: object
});

export const removeFromCollection = (collection, id) => omit(collection, id);
