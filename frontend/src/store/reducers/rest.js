import reduxApi, {transformers} from "redux-api";
import adapterFetch from "redux-api/lib/adapters/fetch";
import fetch from "../../lib/rest";
import {showingDateToString} from "../../lib/dateTools";

const dateTransformer = (date, time) => showingDateToString(date, time);

const movieTransformer = (movie) => {
    const date = dateTransformer(movie.date, movie.time);
    const newMovie = {
        ...movie,
        date
    };
    delete newMovie.time;
    return newMovie;
};

const api = reduxApi({
    showings: {
        url: "/showings",
        transformer: (d) => transformers.array(d).map(showing => ({...showing, movie: movieTransformer(showing.movie)}))
    },
    movies: {
        url: "/movies",
        transformer: (d) => transformers.array(d).map(movieTransformer)
    }
});

api.use("rootUrl", "http://localhost:8080/api");
api.use("fetch", adapterFetch(fetch));

export default api

