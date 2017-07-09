import "whatwg-fetch";
import { withBaseURL } from "./withBaseURL";

const data = {};
const etags = {};

const eTagFetch = (url = null, options = { headers: {} }) => {
  /* eslint no-param-reassign:0 */
  url = url ? url : options.url;
  if (options.method === "GET" || !options.method) {
    const etag = etags[url];
    const cachedResponse = data[`${url}${etag}`]; // ensure etag is for url
    if (etag) {
      options.headers["If-None-Match"] = etag;
    }

    return fetch(url, options).then(response => {
      if (response.status === 304) {
        return cachedResponse.clone();
      }

      if (response.status === 200) {
        const responseEtag = response.headers.get("Etag");

        if (responseEtag) {
          data[`${url}${responseEtag}`] = response.clone();
          etags[url] = responseEtag;
        }
      }

      return response;
    });
  }
  // all other requests go straight to fetch
  // can't use apply(undefined, arguments) as babel uses _arguments which is different..
  return fetch.call(undefined, url, options);
};

const parseResponse = resp => {
  const ct = resp.headers.get("content-type");
  if (ct && ct.indexOf("application/json") !== -1) {
    return resp.json();
  } else {
    return resp.text();
  }
};

const myFetch = (url, opts) => {
  opts = {
    credentials: "include",
    ...opts
  };
  return eTagFetch(url, opts).then(resp => {
    return new Promise((resolve, reject) => {
      return parseResponse(resp).then(parsedResp => {
        if (resp.ok) {
          resolve(parsedResp);
        } else {
          resp.reason = parsedResp.reason || parsedResp;
          reject(resp);
        }
      });
    });
  });
};

export const getJson = url => myFetch(withBaseURL(url));

export const jsonRequest = (path, data, method = "POST") =>
  myFetch(path, {
    method,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  });

export default myFetch;
