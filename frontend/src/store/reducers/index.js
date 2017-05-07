import { combineReducers } from "redux";
import _ from "lodash";

import createCrudReducer, {crudSingleReducer} from "./rest";
import {withBaseURL} from "../../lib/fetch";
import meReducer from './me'

const showingTransformer = (showing) => ({
    ..._.omit(showing, 'time'),
    date: `${showing.date} ${showing.time}`
});

export const showings = createCrudReducer("SHOWINGS", withBaseURL("/showings"), showingTransformer);
export const movies = createCrudReducer("MOVIES", withBaseURL("/movies"));
export const users = createCrudReducer("USERS", withBaseURL("/users"));
export const bioord = crudSingleReducer("BIOORD", withBaseURL("/budord/random"));
export const me = meReducer;

export default combineReducers({
    me: me.reducer,
    showings: showings.reducer,
    users: users.reducer,
    movies: movies.reducer,
    bioord: bioord.reducer
});
