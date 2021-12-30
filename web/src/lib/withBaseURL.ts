// Import VITE_BASE_URL from .env
export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const BASE_API_URL = `/api`;
export const BASE_GRAPHQL_URL = `${BASE_API_URL}/graphql`;
export const withBaseURL = (path: string) => BASE_API_URL + path;
