import { combineReducers } from "redux";

import createCrudReducer from "./rest";

const BASE_URL = "http://localhost:8080/api";
const withBaseURL = (path) => BASE_URL + path;

export const showings = createCrudReducer("SHOWINGS", withBaseURL("/showings"));
export const movies = createCrudReducer("MOVIES", withBaseURL("/movies"));

export default combineReducers({
    showings: showings.reducer,
    movies: movies.reducer
});
