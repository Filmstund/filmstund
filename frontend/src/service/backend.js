
export const fetchEndpoint = (endpoint) => {
      return fetch(`/api/${endpoint}`)
          .then(d => d.json());
};

export const extendArrayFromEndpoint = (array, endpoint) => {
    return fetchEndpoint(endpoint)
      .then(jsonData => [...array, ...jsonData] );
  };

export const extendObjectFromEndpoint = (object, endpoint) => {
  return fetchEndpoint(endpoint)
    .then( jsonData => ({...object, ...jsonData}) );
};
