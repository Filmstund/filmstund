// Import REACT_APP_BASE_URL from .env
export const BASE_URL = process.env.REACT_APP_BASE_URL;
export const BASE_API_URL = `${BASE_URL}/api`;
export const BASE_GRAPHQL_URL = `${BASE_URL}/graphql`;
export const withBaseURL = path => BASE_API_URL + path;
