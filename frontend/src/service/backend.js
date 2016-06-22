import store from '../store'
import { getAuthToken } from '../store/reducer'

let authToken = null

store.subscribe(() => {
  authToken = getAuthToken(store.getState())
})


const fetchJson = (url, options = {}) =>
  fetch(url, options)
    .then(resp => {
      if (resp.ok) {
        return resp
      } else {
        throw resp
      }
    })
    .then(d => d.json())

export const fetchWithoutToken = (endpoint, options) => fetchJson(`/api${endpoint}`, options)

export const extendArrayFromEndpoint = (array, endpoint) => {
    return fetchEndpoint(endpoint)
      .then(jsonData => [...array, ...jsonData] );
  };

export const extendObjectFromEndpoint = (object, endpoint) => {
  return fetchEndpoint(endpoint)
    .then( jsonData => ({...object, ...jsonData}) );
};

export const fetchEndpoint = (url, options = {}) => {
  return fetchWithoutToken(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Token token="${authToken}"`
    }
  })
}

const reduceFormData = (data) =>
  Object.keys(data).reduce((formData, key) => {
    formData.append(key, data[key])
    return formData
  }, new FormData())

export const postEndpoint = (url, data) => {
  const body = reduceFormData(data);

  return fetchEndpoint(url, {
    method: 'post',
    body
  });
}

export const putEndpoint = (url, data) => {
  const body = JSON.stringify(data)

  return fetchEndpoint(url, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });
}
