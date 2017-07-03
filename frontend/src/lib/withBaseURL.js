// Import BASE_URL from .env
export const BASE_URL = process.env.BASE_URL;
export const BASE_API_URL = `${BASE_URL}/api`;
export const withBaseURL = path => BASE_API_URL + path;
