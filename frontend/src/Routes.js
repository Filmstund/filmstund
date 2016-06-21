import React from 'react';
import { Route, IndexRoute } from 'react-router';
import MovieList from './components/movie-list';
import UserProfile from './components/user-profile';
//import NewVisit from './components/new-visit';
import Root from './Root';

const routes = (
  <Route path="/" component={Root}>
    <IndexRoute component={MovieList}/>
    <Route path="showings" component={MovieList}/>
    <Route path="movies" component={MovieList}/>
    <Route path="user" component={UserProfile}/>
  </Route>
);

export default routes;
