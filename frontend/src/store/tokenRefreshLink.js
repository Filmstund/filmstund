import { getExpiresAt, setUserInfo } from "../lib/session";
import isAfter from "date-fns/isAfter";
import addMinutes from "date-fns/addMinutes";
import { setContext } from "apollo-link-context";

export const tokenRefresh = setContext(async (req, { headers }) => {
  const expiresAt = new Date(getExpiresAt() || 0);

  const nowPlusSafeTime = addMinutes(new Date(), 5);

  if (isAfter(nowPlusSafeTime, expiresAt)) {
    const auth = window.gapi.auth2.getAuthInstance();
    const response = await auth.currentUser.get().reloadAuthResponse();
    setUserInfo(response);

    console.log("Refreshed token!");
  }

  // else reuse token!
});
