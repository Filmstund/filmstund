import reduxApi, {transformers} from "redux-api";
import adapterFetch from "redux-api/lib/adapters/fetch";
import fetch from "../../lib/fetch";
import {showingDateToString} from "../../lib/dateTools";

const showingTransformer = (showing) => {
    const date = showingDateToString(showing.date, showing.time);
    const newMovie = {
        ...showing,
        date
    };
    delete newMovie.time;
    return newMovie;
};

const movieTransformer = (movie) => {
    const releaseDate = showingDateToString(movie.releaseDate);
    const newMovie = {
        ...movie,
        releaseDate
    };
    return newMovie;
};

const api = reduxApi({
    showings: {
        url: "/showings",
        reducerName: "showings",
        transformer: (d) => transformers.array(d).map(showingTransformer)
    },
    createShowing: {
        url: "/showings",
        reducerName: "showings",
        options: {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            }
        }
    },
    movies: {
        url: "/movies",
        transformer: (d) => transformers.array(d).map(movieTransformer)
    }
});

api.use("rootUrl", "http://localhost:8080/api");
api.use("fetch", adapterFetch(fetch));

export default api

