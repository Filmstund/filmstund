import { combineReducers } from "redux";
import _ from "lodash";

import createCrudReducer, {crudSingleReducer} from "./rest";
import {withBaseURL} from "../../lib/fetch";

const showingTransformer = (showing) => ({
    ..._.omit(showing, 'time'),
    date: `${showing.date} ${showing.time}`
});

export const showings = createCrudReducer("SHOWINGS", withBaseURL("/showings"), showingTransformer);
export const movies = createCrudReducer("MOVIES", withBaseURL("/movies"));
export const me = crudSingleReducer("ME", withBaseURL("/users/me"));

export default combineReducers({
    me: me.reducer,
    showings: showings.reducer,
    movies: movies.reducer
});
