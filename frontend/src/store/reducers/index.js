import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import createCrudReducer, { crudSingleReducer } from "./rest";
import { withBaseURL } from "../../lib/withBaseURL";
import meReducer from "./me";
import showingsReducer from "./showings";

export const showings = showingsReducer;
export const movies = createCrudReducer("movies", withBaseURL("/movies"));
export const users = createCrudReducer("users", withBaseURL("/users"));
export const bioord = crudSingleReducer(
  "bioord",
  withBaseURL("/budord/random")
);
export const meta = crudSingleReducer("meta", withBaseURL("/movies/sf/meta"));
export const me = meReducer;

export default combineReducers({
  me: me.reducer,
  showings: showings.reducer,
  meta: meta.reducer,
  users: users.reducer,
  movies: movies.reducer,
  bioord: bioord.reducer,
  router: routerReducer
});
