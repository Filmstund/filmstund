import {
  showings as showingActions,
  movies as movieActions,
  users as userActions
} from "../store/reducers";

export const fetchMovie = id => dispatch =>
  dispatch(movieActions.actions.requestSingle(id));

export const fetchShowing = id => dispatch =>
  dispatch(showingActions.actions.requestSingle(id)).then(data => {
    if (data) {
      const { movieId, admin: adminId } = data;
      return Promise.all([
        dispatch(fetchMovie(movieId)),
        dispatch(fetchUser(adminId))
      ]);
    }
  });

export const fetchUser = id => dispatch =>
  dispatch(userActions.actions.requestSingle(id));
