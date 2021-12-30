import { getExpiresAt, getToken, GoogleAuthResponse } from "../lib/session";
import { addMinutes, isAfter } from "date-fns";
import { setContext } from "@apollo/client/link/context";

interface AuthInstance {
  currentUser: {
    get: () => { reloadAuthResponse: () => Promise<GoogleAuthResponse> };
  };
}

declare global {
  interface Window {
    gapi: {
      auth2: {
        getAuthInstance: () => AuthInstance;
      };
    };
  }
}

export const tokenRefresh = setContext(async (req, { headers }) => {
  const expiresAt = new Date(getExpiresAt() || 0);

  let idToken = getToken();

  const nowPlusSafeTime = addMinutes(new Date(), 5);

  if (!idToken || isAfter(nowPlusSafeTime, expiresAt)) {
    // const auth = window.gapi.auth2.getAuthInstance();
    // const response = await auth.currentUser.get().reloadAuthResponse();
    // setUserInfo(response);
    // idToken = response.id_token;

    console.log("Refreshed token!");
  }

  const authorization = idToken ? `Bearer ${idToken}` : "";

  return {
    headers: {
      ...headers,
    },
  };
});
