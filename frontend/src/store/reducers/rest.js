import reduxApi, {transformers} from "redux-api";
import adapterFetch from "redux-api/lib/adapters/fetch";
import fetch from "../../lib/rest";

const api = reduxApi({
    showings: {
        url: "/showings",
        transformer: transformers.array
    },
    movies: {
        url: "/movies",
        transformer: transformers.array
    }
});

api.use("rootUrl", "http://localhost:8080/api");
api.use("fetch", adapterFetch(fetch));

export default api

