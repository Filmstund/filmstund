import { combineReducers } from "redux";
import _ from "lodash";

import createCrudReducer from "./rest";
import {showingDateToString} from "../../lib/dateTools";
import {withBaseURL} from "../../lib/fetch";

const showingTransformer = (showing) => ({
    ..._.omit(showing, 'time'),
    date: showingDateToString(showing.date, showing.time)
});

const movieTransformer = (movie) => ({
    ...movie,
    releaseDate: showingDateToString(movie.releaseDate)
});

export const showings = createCrudReducer("SHOWINGS", withBaseURL("/showings"), showingTransformer);
export const movies = createCrudReducer("MOVIES", withBaseURL("/movies"), movieTransformer);

export default combineReducers({
    showings: showings.reducer,
    movies: movies.reducer
});
