import "whatwg-fetch";
import { getToken, hasToken } from "./session";

const myFetch = (url, options) => {
  const idToken = getToken();

  if (!hasToken) {
    const e = new Error("No token");
    e.noTokenError = true;
    throw e;
  }

  const newOptions = {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${idToken}` }
  };

  return fetch(url, newOptions);
};

export default myFetch;
